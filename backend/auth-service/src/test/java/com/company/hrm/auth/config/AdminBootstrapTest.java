package com.company.hrm.auth.config;

import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapTest {

    private static final String PASSWORD = "Bootstrap#2026";

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminBootstrap bootstrap(String email, String password) {
        return new AdminBootstrap(userRepository, passwordEncoder, email, password);
    }

    @Test
    void createsFirstAdminWhenNoneExists() {
        when(userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(false);
        when(userRepository.existsByEmail("admin@hrm.local")).thenReturn(false);
        when(passwordEncoder.encode(PASSWORD)).thenReturn("hashed");

        bootstrap(" Admin@HRM.local ", PASSWORD).run(null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User admin = captor.getValue();
        assertThat(admin.getEmail()).isEqualTo("admin@hrm.local");
        assertThat(admin.getPasswordHash()).isEqualTo("hashed");
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(admin.getEmployeeId()).isNull();
    }

    @Test
    void doesNothingWhenAnAdminAlreadyExists() {
        when(userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(true);

        bootstrap("admin@hrm.local", PASSWORD).run(null);

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void skipsWithoutFailingWhenNotConfigured() {
        when(userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(false);

        bootstrap("", "").run(null);

        verify(userRepository, never()).save(any());
    }

    @Test
    void failsStartupWhenPasswordIsTooShort() {
        when(userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(false);

        assertThatThrownBy(() -> bootstrap("admin@hrm.local", "short").run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("BOOTSTRAP_ADMIN_PASSWORD");
        verify(userRepository, never()).save(any());
    }

    @Test
    void failsStartupWhenPasswordIsLongButWeak() {
        when(userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(false);

        assertThatThrownBy(() -> bootstrap("admin@hrm.local", "12345678").run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("BOOTSTRAP_ADMIN_PASSWORD");
        verify(userRepository, never()).save(any());
    }

    @Test
    void failsStartupWhenEmailIsInvalid() {
        when(userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(false);

        assertThatThrownBy(() -> bootstrap("not-an-email", PASSWORD).run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("BOOTSTRAP_ADMIN_EMAIL");
    }

    @Test
    void failsStartupWhenEmailBelongsToNonAdminAccount() {
        when(userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(false);
        when(userRepository.existsByEmail("admin@hrm.local")).thenReturn(true);

        assertThatThrownBy(() -> bootstrap("admin@hrm.local", PASSWORD).run(null))
                .isInstanceOf(IllegalStateException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void toleratesConcurrentCreationByAnotherInstance() {
        when(userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(false);
        when(userRepository.existsByEmail("admin@hrm.local")).thenReturn(false);
        when(passwordEncoder.encode(PASSWORD)).thenReturn("hashed");
        when(userRepository.save(any())).thenThrow(new DataIntegrityViolationException("uk_users_email"));

        assertThatCode(() -> bootstrap("admin@hrm.local", PASSWORD).run(null)).doesNotThrowAnyException();
    }
}
