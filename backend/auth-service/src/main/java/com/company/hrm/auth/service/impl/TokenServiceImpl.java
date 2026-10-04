package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.dto.response.LoginResponse;
import com.company.hrm.auth.dto.response.TokenRefreshResponse;
import com.company.hrm.auth.dto.response.UserSummaryResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.exception.UnauthorizedException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.service.TokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
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

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    private static final String REDIS_REFRESH_PREFIX = "auth:refresh:";
    private static final String REDIS_BLACKLIST_PREFIX = "auth:blacklist:";
    private static final String REDIS_OTP_PREFIX = "auth:otp:";
    private static final String REDIS_RESET_PREFIX = "auth:reset:";

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public LoginResponse generateTokens(User user) {
        String accessToken = createAccessToken(user);
        String refreshToken = createRefreshToken(user);

        UserSummaryResponse userSummary = userMapper.toSummaryResponse(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userSummary)
                .build();
    }

    @Override
    public TokenRefreshResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token không tồn tại");
        }

        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();
        } catch (JwtException e) {
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String userIdStr = claims.getSubject();
        String jti = claims.getId();
        if (userIdStr == null || jti == null) {
            throw new UnauthorizedException("Token không hợp lệ");
        }

        String redisKey = REDIS_REFRESH_PREFIX + userIdStr + ":" + jti;
        Boolean exists = redisTemplate.hasKey(redisKey);

        if (Boolean.FALSE.equals(exists)) {
            log.warn("Cảnh báo bảo mật: Phát hiện sử dụng lại Refresh Token đã hết hiệu lực của user: {}. Thu hồi toàn bộ phiên đăng nhập!", userIdStr);
            revokeAllUserTokens(userIdStr);
            throw new UnauthorizedException("Phát hiện bất thường về phiên đăng nhập. Vui lòng đăng nhập lại!");
        }

        redisTemplate.delete(redisKey);

        User user = userRepository.findById(UUID.fromString(userIdStr))
                .orElseThrow(() -> new UnauthorizedException("Người dùng không còn tồn tại"));

        String newAccessToken = createAccessToken(user);
        String newRefreshToken = createRefreshToken(user);

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
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
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Date expiration = claims.getExpiration();
            long remainingTimeMs = expiration.getTime() - System.currentTimeMillis();

            if (remainingTimeMs > 0) {
                String blacklistKey = REDIS_BLACKLIST_PREFIX + token;
                redisTemplate.opsForValue().set(blacklistKey, "revoked", remainingTimeMs, TimeUnit.MILLISECONDS);
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
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();

            String userIdStr = claims.getSubject();
            String jti = claims.getId();
            if (userIdStr != null && jti != null) {
                redisTemplate.delete(REDIS_REFRESH_PREFIX + userIdStr + ":" + jti);
            }
        } catch (JwtException e) {
            log.debug("Token không hợp lệ khi thu hồi: {}", e.getMessage());
        }
    }

    @Override
    public void storeOtp(String email, String otp) {
        String key = REDIS_OTP_PREFIX + email.toLowerCase();
        redisTemplate.opsForValue().set(key, otp, 5, TimeUnit.MINUTES);
    }

    @Override
    public String verifyOtpAndGenerateResetToken(String email, String otp) {
        String key = REDIS_OTP_PREFIX + email.toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new BadRequestException("Mã OTP không chính xác hoặc đã hết hạn");
        }

        redisTemplate.delete(key);

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(REDIS_RESET_PREFIX + resetToken, email.toLowerCase(), 15, TimeUnit.MINUTES);

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
        Set<String> keys = redisTemplate.keys(REDIS_REFRESH_PREFIX + userId + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private String createAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(Duration.ofMillis(accessTokenExpirationMs));

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("employeeId", user.getEmployeeId() != null ? user.getEmployeeId().toString() : null)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(getSigningKey())
                .compact();
    }

    private String createRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(Duration.ofMillis(refreshTokenExpirationMs));
        String jti = UUID.randomUUID().toString();

        String token = Jwts.builder()
                .id(jti)
                .subject(user.getId().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(getSigningKey())
                .compact();

        String redisKey = REDIS_REFRESH_PREFIX + user.getId() + ":" + jti;
        redisTemplate.opsForValue().set(redisKey, "valid", refreshTokenExpirationMs, TimeUnit.MILLISECONDS);

        return token;
    }
}
