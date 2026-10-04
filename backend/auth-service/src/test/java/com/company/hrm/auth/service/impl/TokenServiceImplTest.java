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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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
            refreshToken = tokenService.generateTokens(user).getRefreshToken();
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
    class VerifyOtp {

        @Test
        void returnsResetTokenAndConsumesOtpWhenCodeMatches() {
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn("123456");
            when(redisTemplate.delete("auth:otp:" + EMAIL)).thenReturn(true);

            String resetToken = tokenService.verifyOtpAndGenerateResetToken(EMAIL, "123456");

            assertThat(resetToken).isNotBlank();
            verify(valueOperations).set(eq("auth:reset:" + resetToken), eq(EMAIL), anyLong(), any());
        }

        @Test
        void countsFailedAttemptWhenCodeIsWrong() {
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn("123456");
            when(valueOperations.increment("auth:otp:attempts:" + EMAIL)).thenReturn(1L);

            assertThatThrownBy(() -> tokenService.verifyOtpAndGenerateResetToken(EMAIL, "000000"))
                    .isInstanceOf(BadRequestException.class);
            verify(redisTemplate).expire(eq("auth:otp:attempts:" + EMAIL), any(Duration.class));
        }

        @Test
        void invalidatesOtpAfterTooManyWrongAttempts() {
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn("123456");
            when(valueOperations.increment("auth:otp:attempts:" + EMAIL)).thenReturn(5L);

            assertThatThrownBy(() -> tokenService.verifyOtpAndGenerateResetToken(EMAIL, "000000"))
                    .isInstanceOf(TooManyRequestsException.class);
            verify(redisTemplate).delete(List.of("auth:otp:" + EMAIL, "auth:otp:attempts:" + EMAIL));
        }

        @Test
        void rejectsWhenOtpAlreadyConsumedByConcurrentRequest() {
            when(valueOperations.get("auth:otp:" + EMAIL)).thenReturn("123456");
            when(redisTemplate.delete("auth:otp:" + EMAIL)).thenReturn(false);

            assertThatThrownBy(() -> tokenService.verifyOtpAndGenerateResetToken(EMAIL, "123456"))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        void storingNewOtpResetsAttemptCounter() {
            tokenService.storeOtp(EMAIL, "654321");

            verify(valueOperations).set(eq("auth:otp:" + EMAIL), eq("654321"), any(Duration.class));
            verify(redisTemplate).delete("auth:otp:attempts:" + EMAIL);
        }
    }
}
