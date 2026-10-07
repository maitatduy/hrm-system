package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.dto.TokenPair;
import com.company.hrm.auth.dto.request.ForgotPasswordRequest;
import com.company.hrm.auth.dto.request.LoginRequest;
import com.company.hrm.auth.dto.response.LoginResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.exception.ForbiddenException;
import com.company.hrm.auth.exception.TooManyRequestsException;
import com.company.hrm.auth.exception.UnauthorizedException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.service.EmailService;
import com.company.hrm.auth.service.RateLimitService;
import com.company.hrm.auth.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplLoginTest {

    private static final String EMAIL = "user@hrm.vn";
    private static final String PASSWORD = "Secret@123";

    @Mock
    private UserRepository userRepository;
    @Mock
    private TokenService tokenService;
    @Mock
    private EmailService emailService;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RateLimitService rateLimitService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email(EMAIL)
                .passwordHash("hash")
                .role(Role.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    void loginSucceedsAndResetsFailureCounter() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD, "hash")).thenReturn(true);
        when(tokenService.generateTokens(user, true)).thenReturn(TokenPair.builder()
                .accessToken("access")
                .refreshToken("refresh")
                .refreshTokenCookieMaxAge(Duration.ofDays(7))
                .build());
        MockHttpServletResponse response = new MockHttpServletResponse();

        LoginResponse result = authService.login(new LoginRequest(EMAIL, PASSWORD, true), response);

        assertThat(result.getAccessToken()).isEqualTo("access");
        assertThat(response.getHeader("Set-Cookie")).contains("refreshToken=refresh", "HttpOnly", "Max-Age=604800");
        verify(rateLimitService).resetLoginFailures(EMAIL);
    }

    @Test
    void loginWithoutRememberMeSetsSessionCookie() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD, "hash")).thenReturn(true);
        when(tokenService.generateTokens(user, false)).thenReturn(TokenPair.builder()
                .accessToken("access")
                .refreshToken("refresh")
                .build());
        MockHttpServletResponse response = new MockHttpServletResponse();

        authService.login(new LoginRequest(EMAIL, PASSWORD, false), response);

        assertThat(response.getHeader("Set-Cookie"))
                .contains("refreshToken=refresh", "HttpOnly")
                .doesNotContain("Max-Age")
                .doesNotContain("Expires");
    }

    @Test
    void wrongPasswordRecordsFailure() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, "wrong", false), new MockHttpServletResponse()))
                .isInstanceOf(UnauthorizedException.class);
        verify(rateLimitService).recordLoginFailure(EMAIL);
    }

    @Test
    void unknownEmailRecordsFailureWithSameError() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, PASSWORD, false), new MockHttpServletResponse()))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Email hoặc mật khẩu không chính xác");
        verify(rateLimitService).recordLoginFailure(EMAIL);
    }

    @Test
    void unknownEmailStillRunsPasswordCheckAgainstDummyHash() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("dummy-hash");

        for (int i = 0; i < 2; i++) {
            assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, PASSWORD, false), new MockHttpServletResponse()))
                    .isInstanceOf(UnauthorizedException.class);
        }

        // Cùng chi phí BCrypt với email có thật, hash giả chỉ tạo một lần
        verify(passwordEncoder, times(2)).matches(PASSWORD, "dummy-hash");
        verify(passwordEncoder, times(1)).encode(anyString());
    }

    @Test
    void lockedAccountWithWrongPasswordDoesNotRevealLockedStatus() {
        user.setStatus(UserStatus.LOCKED);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, "wrong", false), new MockHttpServletResponse()))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void lockedAccountWithCorrectPasswordIsForbidden() {
        user.setStatus(UserStatus.LOCKED);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD, "hash")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, PASSWORD, false), new MockHttpServletResponse()))
                .isInstanceOf(ForbiddenException.class);
        verify(tokenService, never()).generateTokens(any(), anyBoolean());
    }

    @Test
    void rateLimitedLoginIsRejectedBeforeCheckingCredentials() {
        doThrow(new TooManyRequestsException("limit")).when(rateLimitService).checkLoginAllowed(EMAIL);

        assertThatThrownBy(() -> authService.login(new LoginRequest(EMAIL, PASSWORD, false), new MockHttpServletResponse()))
                .isInstanceOf(TooManyRequestsException.class);
        verifyNoInteractions(userRepository, passwordEncoder);
    }

    @Test
    void logoutWithoutAccessTokenStillRevokesRefreshTokenAndClearsCookie() {
        // Access token đã bị thu hồi (đổi mật khẩu, bị khóa) nên frontend chỉ còn cookie refresh token
        MockHttpServletResponse response = new MockHttpServletResponse();

        authService.logout(null, "refresh-token-in-cookie", response);

        verify(tokenService).revokeRefreshToken("refresh-token-in-cookie");
        verify(tokenService, never()).blacklistAccessToken(anyString());
        assertThat(response.getHeader("Set-Cookie")).startsWith("refreshToken=;").contains("Max-Age=0");
    }

    @Test
    void forgotPasswordRespectsCooldownBeforeLookingUpUser() {
        doThrow(new TooManyRequestsException("cooldown")).when(rateLimitService).acquireOtpRequestSlot(EMAIL);

        assertThatThrownBy(() -> authService.forgotPassword(new ForgotPasswordRequest(EMAIL)))
                .isInstanceOf(TooManyRequestsException.class);
        verifyNoInteractions(userRepository, emailService);
    }
}
