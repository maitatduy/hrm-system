package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.dto.TokenPair;
import com.company.hrm.auth.dto.response.UserSummaryResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.exception.TooManyRequestsException;
import com.company.hrm.auth.exception.UnauthorizedException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.security.JwtTokens;
import com.company.hrm.auth.security.OtpHasher;
import com.company.hrm.auth.service.TokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final JwtTokens jwtTokens;
    private final OtpHasher otpHasher;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpirationMs;

    /** Thời gian sống refresh token khi người dùng chọn ghi nhớ đăng nhập. */
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    /** Thời gian sống refresh token khi không ghi nhớ, giới hạn phiên nếu trình duyệt tự khôi phục cookie phiên. */
    @Value("${jwt.refresh-token-session-expiration}")
    private long sessionRefreshTokenExpirationMs;

    private static final String REDIS_REFRESH_PREFIX = "auth:refresh:";
    private static final String REDIS_BLACKLIST_PREFIX = "auth:blacklist:";
    private static final String REDIS_OTP_PREFIX = "auth:otp:";
    private static final String REDIS_RESET_PREFIX = "auth:reset:";
    private static final String REDIS_OTP_ATTEMPTS_PREFIX = "auth:otp:attempts:";

    private static final String REMEMBER_ME_CLAIM = "remember";
    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final Duration REFRESH_REUSE_GRACE = Duration.ofSeconds(10);

    @Override
    public TokenPair generateTokens(User user, boolean rememberMe) {
        TokenPair tokenPair = issueTokens(user, rememberMe);
        tokenPair.setUser(userMapper.toSummaryResponse(user));
        return tokenPair;
    }

    @Override
    public TokenPair refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token không tồn tại");
        }

        Claims claims;
        try {
            // Access token đặt vào cookie refresh bị từ chối ở đây, trước khi chạm tới logic phát hiện dùng lại
            claims = jwtTokens.parseRefresh(refreshToken);
        } catch (JwtException e) {
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String userIdStr = claims.getSubject();
        String jti = claims.getId();
        if (userIdStr == null || jti == null) {
            throw new UnauthorizedException("Token không hợp lệ");
        }

        // DEL là thao tác atomic: chỉ đúng một request được "tiêu thụ" refresh token này
        String redisKey = refreshKey(userIdStr, jti);
        String graceKey = refreshGraceKey(userIdStr, jti);
        boolean consumed = Boolean.TRUE.equals(redisTemplate.delete(redisKey));

        if (consumed) {
            redisTemplate.opsForValue().set(graceKey, "rotated", REFRESH_REUSE_GRACE);
        } else if (!Boolean.TRUE.equals(redisTemplate.hasKey(graceKey))) {
            log.warn("Cảnh báo bảo mật: Phát hiện sử dụng lại Refresh Token đã hết hiệu lực của user: {}. Thu hồi toàn bộ phiên đăng nhập!", userIdStr);
            revokeAllUserTokens(userIdStr);
            throw new UnauthorizedException("Phát hiện bất thường về phiên đăng nhập. Vui lòng đăng nhập lại!");
        } else {
            // Request đồng thời (nhiều tab cùng refresh) trong khoảng ân hạn: cấp cặp token mới, không coi là tấn công
            log.debug("Refresh token {} của user {} được dùng lại trong khoảng ân hạn", jti, userIdStr);
        }

        User user = userRepository.findById(UUID.fromString(userIdStr))
                .orElseThrow(() -> new UnauthorizedException("Người dùng không còn tồn tại"));

        if (user.getStatus() == UserStatus.LOCKED) {
            revokeAllUserTokens(userIdStr);
            throw new UnauthorizedException("Tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên.");
        }

        // Token cấp trước khi có tính năng ghi nhớ không có claim này, coi như đã chọn ghi nhớ như hành vi cũ
        boolean rememberMe = !Boolean.FALSE.equals(claims.get(REMEMBER_ME_CLAIM, Boolean.class));
        return issueTokens(user, rememberMe);
    }

    private TokenPair issueTokens(User user, boolean rememberMe) {
        return TokenPair.builder()
                .accessToken(createAccessToken(user))
                .refreshToken(createRefreshToken(user, rememberMe))
                .refreshTokenCookieMaxAge(rememberMe ? Duration.ofMillis(refreshTokenExpirationMs) : null)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public void blacklistAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return;
        }

        String token = accessToken.startsWith("Bearer ") ? accessToken.substring(7) : accessToken;

        try {
            Claims claims = jwtTokens.parseAccess(token);

            String jti = claims.getId();
            Date expiration = claims.getExpiration();
            long remainingTimeMs = expiration.getTime() - System.currentTimeMillis();

            if (remainingTimeMs > 0) {
                if (jti != null && !jti.isBlank()) {
                    String blacklistKey = REDIS_BLACKLIST_PREFIX + jti;
                    redisTemplate.opsForValue().set(blacklistKey, "revoked", remainingTimeMs, TimeUnit.MILLISECONDS);
                } else {
                    String blacklistKey = REDIS_BLACKLIST_PREFIX + token;
                    redisTemplate.opsForValue().set(blacklistKey, "revoked", remainingTimeMs, TimeUnit.MILLISECONDS);
                }
            }
        } catch (JwtException e) {
            log.debug("Token không hợp lệ hoặc đã hết hạn khi blacklist, bỏ qua: {}", e.getMessage());
        }
    }

    @Override
    public void revokeRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        try {
            Claims claims = jwtTokens.parseRefresh(refreshToken);

            String userIdStr = claims.getSubject();
            String jti = claims.getId();
            if (userIdStr != null && jti != null) {
                redisTemplate.delete(List.of(refreshKey(userIdStr, jti), refreshGraceKey(userIdStr, jti)));
            }
        } catch (JwtException e) {
            log.debug("Token không hợp lệ khi thu hồi: {}", e.getMessage());
        }
    }

    @Override
    public void storeOtp(String email, String otp) {
        String normalizedEmail = email.toLowerCase();
        redisTemplate.opsForValue().set(REDIS_OTP_PREFIX + normalizedEmail, otpHasher.hash(normalizedEmail, otp), OTP_TTL);
        redisTemplate.delete(REDIS_OTP_ATTEMPTS_PREFIX + normalizedEmail);
    }

    @Override
    public String verifyOtpAndGenerateResetToken(String email, String otp) {
        String normalizedEmail = email.toLowerCase();
        String otpKey = REDIS_OTP_PREFIX + normalizedEmail;
        String attemptsKey = REDIS_OTP_ATTEMPTS_PREFIX + normalizedEmail;
        String storedOtpHash = redisTemplate.opsForValue().get(otpKey);

        if (storedOtpHash == null) {
            throw new BadRequestException("Mã OTP không chính xác hoặc đã hết hạn");
        }

        if (!otpHasher.matches(storedOtpHash, normalizedEmail, otp)) {
            Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
            if (attempts != null && attempts == 1) {
                redisTemplate.expire(attemptsKey, OTP_TTL);
            }
            if (attempts != null && attempts >= MAX_OTP_ATTEMPTS) {
                // Hủy OTP để chặn dò mã, người dùng phải yêu cầu mã mới
                redisTemplate.delete(List.of(otpKey, attemptsKey));
                log.warn("Email {} nhập sai OTP {} lần, đã hủy mã OTP hiện tại", normalizedEmail, attempts);
                throw new TooManyRequestsException("Bạn đã nhập sai mã OTP quá số lần cho phép. Vui lòng yêu cầu mã mới.");
            }
            throw new BadRequestException("Mã OTP không chính xác hoặc đã hết hạn");
        }

        // Chỉ một request được tiêu thụ OTP nếu có nhiều request đúng mã gửi đồng thời
        if (!Boolean.TRUE.equals(redisTemplate.delete(otpKey))) {
            throw new BadRequestException("Mã OTP không chính xác hoặc đã hết hạn");
        }
        redisTemplate.delete(attemptsKey);

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(REDIS_RESET_PREFIX + resetToken, normalizedEmail, 15, TimeUnit.MINUTES);

        return resetToken;
    }

    @Override
    public String validateResetToken(String resetToken) {
        String email = redisTemplate.opsForValue().get(REDIS_RESET_PREFIX + resetToken);
        if (email == null) {
            throw new BadRequestException("Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
        }
        return email;
    }

    @Override
    public void revokeResetToken(String resetToken) {
        redisTemplate.delete(REDIS_RESET_PREFIX + resetToken);
    }

    @Override
    public void revokeAllUserTokens(String userId) {
        ScanOptions options = ScanOptions.scanOptions()
                .match(REDIS_REFRESH_PREFIX + userId + ":*")
                .count(100)
                .build();

        Set<String> keysToDelete = new HashSet<>();
        try (Cursor<String> cursor = redisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                keysToDelete.add(cursor.next());
            }
        } catch (Exception e) {
            log.error("Lỗi khi scan refresh token của user {}: {}", userId, e.getMessage());
        }

        if (!keysToDelete.isEmpty()) {
            redisTemplate.delete(keysToDelete);
            log.info("Đã thu hồi {} refresh token của user {}", keysToDelete.size(), userId);
        }
    }

    private String createAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(Duration.ofMillis(accessTokenExpirationMs));
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .id(jti)
                .subject(user.getId().toString())
                .claim(JwtTokens.TYPE_CLAIM, JwtTokens.ACCESS_TYPE)
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("employeeId", user.getEmployeeId() != null ? user.getEmployeeId().toString() : null)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(jwtTokens.accessKey())
                .compact();
    }

    private String createRefreshToken(User user, boolean rememberMe) {
        long ttlMs = rememberMe ? refreshTokenExpirationMs : sessionRefreshTokenExpirationMs;
        Instant now = Instant.now();
        Instant expiry = now.plus(Duration.ofMillis(ttlMs));
        String jti = UUID.randomUUID().toString();

        String token = Jwts.builder()
                .id(jti)
                .subject(user.getId().toString())
                .claim(JwtTokens.TYPE_CLAIM, JwtTokens.REFRESH_TYPE)
                .claim(REMEMBER_ME_CLAIM, rememberMe)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(jwtTokens.refreshKey())
                .compact();

        String redisKey = refreshKey(user.getId().toString(), jti);
        redisTemplate.opsForValue().set(redisKey, "valid", ttlMs, TimeUnit.MILLISECONDS);

        return token;
    }

    // Grace key nằm dưới prefix auth:refresh:{userId}: nên revokeAllUserTokens cũng xóa luôn
    private String refreshKey(String userId, String jti) {
        return REDIS_REFRESH_PREFIX + userId + ":" + jti;
    }

    private String refreshGraceKey(String userId, String jti) {
        return REDIS_REFRESH_PREFIX + userId + ":grace:" + jti;
    }
}
