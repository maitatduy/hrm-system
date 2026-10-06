package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.dto.TokenPair;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.exception.TooManyRequestsException;
import com.company.hrm.auth.exception.UnauthorizedException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TokenServiceImplTest {

    private static final String EMAIL = "user@hrm.vn";

    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private TokenServiceImpl tokenService;

    private User user;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(tokenService, "jwtSecret", "test-secret-key-that-is-at-least-32-bytes-long!!");
        ReflectionTestUtils.setField(tokenService, "accessTokenExpirationMs", 900_000L);
        ReflectionTestUtils.setField(tokenService, "refreshTokenExpirationMs", 604_800_000L);
        ReflectionTestUtils.setField(tokenService, "sessionRefreshTokenExpirationMs", 86_400_000L);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        user = User.builder()
                .id(UUID.randomUUID())
                .email(EMAIL)
                .role(Role.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
    }

    @Nested
    class RefreshToken {

        private String refreshToken;

        @BeforeEach
        void issueToken() {
            refreshToken = tokenService.generateTokens(user, true).getRefreshToken();
        }

        @Test
        void rotatesTokenAndOpensGraceWindowWhenTokenIsConsumed() {
            when(redisTemplate.delete(anyString())).thenReturn(true);

            TokenPair result = tokenService.refreshToken(refreshToken);

            assertThat(result.getAccessToken()).isNotBlank();
            assertThat(result.getRefreshToken()).isNotBlank().isNotEqualTo(refreshToken);
            verify(valueOperations).set(
                    startsWith("auth:refresh:" + user.getId() + ":grace:"),
                    eq("rotated"),
                    any(Duration.class)
            );
        }

        @Test
        void issuesNewTokensForConcurrentRequestInsideGraceWindow() {
            when(redisTemplate.delete(anyString())).thenReturn(false);
            when(redisTemplate.hasKey(startsWith("auth:refresh:" + user.getId() + ":grace:"))).thenReturn(true);

            TokenPair result = tokenService.refreshToken(refreshToken);

            assertThat(result.getAccessToken()).isNotBlank();
            verify(redisTemplate, never()).scan(any(ScanOptions.class));
        }

        @Test
        @SuppressWarnings("unchecked")
        void revokesAllSessionsWhenTokenIsReusedAfterGraceWindow() {
            Cursor<String> emptyCursor = mock(Cursor.class);
            when(redisTemplate.delete(anyString())).thenReturn(false);
            when(redisTemplate.hasKey(anyString())).thenReturn(false);
            when(redisTemplate.scan(any(ScanOptions.class))).thenReturn(emptyCursor);

            assertThatThrownBy(() -> tokenService.refreshToken(refreshToken))
                    .isInstanceOf(UnauthorizedException.class);
            verify(redisTemplate).scan(any(ScanOptions.class));
        }

        @Test
        @SuppressWarnings("unchecked")
        void rejectsRefreshForLockedUser() {
            Cursor<String> emptyCursor = mock(Cursor.class);
            user.setStatus(UserStatus.LOCKED);
            when(redisTemplate.delete(anyString())).thenReturn(true);
            when(redisTemplate.scan(any(ScanOptions.class))).thenReturn(emptyCursor);

            assertThatThrownBy(() -> tokenService.refreshToken(refreshToken))
                    .isInstanceOf(UnauthorizedException.class);
        }
    }

    @Nested
    class TokenType {

        private TokenPair tokens;

        @BeforeEach
        void issueTokens() {
            tokens = tokenService.generateTokens(user, true);
            clearInvocations(redisTemplate, valueOperations);
        }

        @Test
        void accessTokenInRefreshCookieIsRejectedWithoutRevokingSessions() {
            assertThatThrownBy(() -> tokenService.refreshToken(tokens.getAccessToken()))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessage("Refresh token không hợp lệ hoặc đã hết hạn");

            verify(redisTemplate, never()).delete(anyString());
            verify(redisTemplate, never()).scan(any(ScanOptions.class));
        }

        @Test
        void refreshTokenCannotBeBlacklistedAsAccessToken() {
            tokenService.blacklistAccessToken(tokens.getRefreshToken());

            verify(valueOperations, never()).set(startsWith("auth:blacklist:"), anyString(), anyLong(), any(TimeUnit.class));
        }

        @Test
        void accessTokenCannotRevokeRefreshSession() {
            tokenService.revokeRefreshToken(tokens.getAccessToken());

            verify(redisTemplate, never()).delete(any(java.util.Collection.class));
        }

        @Test
        void blacklistsAccessToken() {
            tokenService.blacklistAccessToken(tokens.getAccessToken());

            verify(valueOperations).set(startsWith("auth:blacklist:"), eq("revoked"), anyLong(), eq(TimeUnit.MILLISECONDS));
        }
    }

    @Nested
    class RememberMe {

        private static final long REMEMBER_TTL_MS = 604_800_000L;
        private static final long SESSION_TTL_MS = 86_400_000L;

        private void verifyRefreshTokenStoredFor(long ttlMs, int times) {
            verify(valueOperations, times(times)).set(
                    startsWith("auth:refresh:" + user.getId() + ":"),
                    eq("valid"),
                    eq(ttlMs),
                    eq(TimeUnit.MILLISECONDS)
            );
        }

        @Test
        void rememberedLoginGetsPersistentCookieAndLongRefreshToken() {
            TokenPair result = tokenService.generateTokens(user, true);

            assertThat(result.getRefreshTokenCookieMaxAge()).isEqualTo(Duration.ofMillis(REMEMBER_TTL_MS));
            verifyRefreshTokenStoredFor(REMEMBER_TTL_MS, 1);
        }

        @Test
        void sessionLoginGetsSessionCookieAndShortRefreshToken() {
            TokenPair result = tokenService.generateTokens(user, false);

            assertThat(result.getRefreshTokenCookieMaxAge()).isNull();
            verifyRefreshTokenStoredFor(SESSION_TTL_MS, 1);
        }

        @Test
        void refreshKeepsTheChoiceMadeAtLogin() {
            String sessionToken = tokenService.generateTokens(user, false).getRefreshToken();
            when(redisTemplate.delete(anyString())).thenReturn(true);

            TokenPair rotated = tokenService.refreshToken(sessionToken);

            assertThat(rotated.getRefreshTokenCookieMaxAge()).isNull();
            verifyRefreshTokenStoredFor(SESSION_TTL_MS, 2);
        }
    }

    @Nested
    class VerifyOtp {

        /** OTP được lưu dạng HMAC, lấy giá trị đã lưu thật qua storeOtp để dùng làm dữ liệu Redis giả. */
        private String storedHashOf(String otp) {
            tokenService.storeOtp(EMAIL, otp);
            ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
            verify(valueOperations).set(eq("auth:otp:" + EMAIL), captor.capture(), any(Duration.class));
            clearInvocations(valueOperations, redisTemplate);
            return captor.getValue();
        }

        @Test
        void storesOnlyAHashOfTheOtpAndResetsAttemptCounter() {
            tokenService.storeOtp(EMAIL, "654321");

            ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
            verify(valueOperations).set(eq("auth:otp:" + EMAIL), captor.capture(), eq(TokenService.OTP_TTL));
            verify(redisTemplate).delete("auth:otp:attempts:" + EMAIL);
            assertThat(captor.getValue()).doesNotContain("654321").hasSize(64);
        }

        @Test
        void returnsResetTokenAndConsumesOtpWhenCodeMatches() {
            String storedHash = storedHashOf("123456");
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn(storedHash);
            when(redisTemplate.delete("auth:otp:" + EMAIL)).thenReturn(true);

            String resetToken = tokenService.verifyOtpAndGenerateResetToken(EMAIL, "123456");

            assertThat(resetToken).isNotBlank();
            verify(valueOperations).set(eq("auth:reset:" + resetToken), eq(EMAIL), anyLong(), any());
        }

        @Test
        void countsFailedAttemptWhenCodeIsWrong() {
            String storedHash = storedHashOf("123456");
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn(storedHash);
            when(valueOperations.increment("auth:otp:attempts:" + EMAIL)).thenReturn(1L);

            assertThatThrownBy(() -> tokenService.verifyOtpAndGenerateResetToken(EMAIL, "000000"))
                    .isInstanceOf(BadRequestException.class);
            verify(redisTemplate).expire(eq("auth:otp:attempts:" + EMAIL), any(Duration.class));
        }

        @Test
        void rejectsTheRawOtpIfItWasStoredWithoutHashing() {
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn("123456");
            when(valueOperations.increment("auth:otp:attempts:" + EMAIL)).thenReturn(1L);

            assertThatThrownBy(() -> tokenService.verifyOtpAndGenerateResetToken(EMAIL, "123456"))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        void invalidatesOtpAfterTooManyWrongAttempts() {
            String storedHash = storedHashOf("123456");
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn(storedHash);
            when(valueOperations.increment("auth:otp:attempts:" + EMAIL)).thenReturn(5L);

            assertThatThrownBy(() -> tokenService.verifyOtpAndGenerateResetToken(EMAIL, "000000"))
                    .isInstanceOf(TooManyRequestsException.class);
            verify(redisTemplate).delete(List.of("auth:otp:" + EMAIL, "auth:otp:attempts:" + EMAIL));
        }

        @Test
        void rejectsWhenOtpAlreadyConsumedByConcurrentRequest() {
            String storedHash = storedHashOf("123456");
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn(storedHash);
            when(redisTemplate.delete("auth:otp:" + EMAIL)).thenReturn(false);

            assertThatThrownBy(() -> tokenService.verifyOtpAndGenerateResetToken(EMAIL, "123456"))
                    .isInstanceOf(BadRequestException.class);
        }
    }
}
