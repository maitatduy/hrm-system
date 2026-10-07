package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.client.EmployeeServiceClient;
import com.company.hrm.auth.dto.response.AccountResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.exception.ConflictException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AccountServiceImplAdminGuardTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private EmployeeServiceClient employeeServiceClient;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TokenService tokenService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AccountServiceImpl accountService;

    private User actor;
    private User otherAdmin;
    private User employee;

    @BeforeEach
    void setUp() {
        actor = user(Role.ADMIN, UserStatus.ACTIVE);
        otherAdmin = user(Role.ADMIN, UserStatus.ACTIVE);
        employee = user(Role.EMPLOYEE, UserStatus.ACTIVE);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toAccountResponse(any(User.class))).thenReturn(new AccountResponse());
    }

    private User user(Role role, UserStatus status) {
        User user = User.builder().id(UUID.randomUUID()).email(UUID.randomUUID() + "@hrm.vn").role(role).status(status).build();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        return user;
    }

    private void activeAdmins(User... admins) {
        when(userRepository.lockByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)).thenReturn(List.of(admins));
    }

    @Nested
    class LockAccount {

        @Test
        void locksEmployeeAndRevokesSessions() {
            accountService.lockAccount(actor.getId(), employee.getId());

            assertThat(employee.getStatus()).isEqualTo(UserStatus.LOCKED);
            verify(tokenService).revokeAllUserTokens(employee.getId().toString());
            // Không phải ADMIN thì không cần khóa danh sách ADMIN
            verify(userRepository, never()).lockByRoleAndStatus(any(), any());
        }

        @Test
        void adminCannotLockThemselves() {
            assertThatThrownBy(() -> accountService.lockAccount(actor.getId(), actor.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessage("Không thể tự khóa tài khoản của chính mình");

            assertThat(actor.getStatus()).isEqualTo(UserStatus.ACTIVE);
            verify(tokenService, never()).revokeAllUserTokens(anyString());
        }

        @Test
        void canLockAnotherAdminWhileAnActiveAdminRemains() {
            activeAdmins(actor, otherAdmin);

            accountService.lockAccount(actor.getId(), otherAdmin.getId());

            assertThat(otherAdmin.getStatus()).isEqualTo(UserStatus.LOCKED);
        }

        @Test
        void cannotLockTheLastActiveAdmin() {
            // Tình huống đồng thời: actor đã bị khóa ở transaction khác, otherAdmin là ADMIN đang hoạt động cuối cùng
            activeAdmins(otherAdmin);

            assertThatThrownBy(() -> accountService.lockAccount(actor.getId(), otherAdmin.getId()))
                    .isInstanceOf(ConflictException.class)
                    .hasMessage("Hệ thống phải còn ít nhất một quản trị viên đang hoạt động");

            assertThat(otherAdmin.getStatus()).isEqualTo(UserStatus.ACTIVE);
            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    class UpdateRole {

        @Test
        void changesRoleAndRevokesSessions() {
            accountService.updateRole(actor.getId(), employee.getId(), Role.HR);

            assertThat(employee.getRole()).isEqualTo(Role.HR);
            verify(tokenService).revokeAllUserTokens(employee.getId().toString());
        }

        @Test
        void sameRoleIsANoOpWithoutRevokingSessions() {
            accountService.updateRole(actor.getId(), employee.getId(), Role.EMPLOYEE);

            verify(userRepository, never()).save(any());
            verify(tokenService, never()).revokeAllUserTokens(anyString());
        }

        @Test
        void adminCannotChangeTheirOwnRole() {
            assertThatThrownBy(() -> accountService.updateRole(actor.getId(), actor.getId(), Role.HR))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessage("Không thể tự thay đổi vai trò của chính mình");

            assertThat(actor.getRole()).isEqualTo(Role.ADMIN);
        }

        @Test
        void cannotDemoteTheLastActiveAdmin() {
            activeAdmins(otherAdmin);

            assertThatThrownBy(() -> accountService.updateRole(actor.getId(), otherAdmin.getId(), Role.EMPLOYEE))
                    .isInstanceOf(ConflictException.class);

            assertThat(otherAdmin.getRole()).isEqualTo(Role.ADMIN);
        }

        @Test
        void canDemoteAnotherAdminWhileAnActiveAdminRemains() {
            activeAdmins(actor, otherAdmin);

            accountService.updateRole(actor.getId(), otherAdmin.getId(), Role.MANAGER);

            assertThat(otherAdmin.getRole()).isEqualTo(Role.MANAGER);
        }

        @Test
        void demotingALockedAdminDoesNotNeedTheGuard() {
            User lockedAdmin = user(Role.ADMIN, UserStatus.LOCKED);

            accountService.updateRole(actor.getId(), lockedAdmin.getId(), Role.EMPLOYEE);

            assertThat(lockedAdmin.getRole()).isEqualTo(Role.EMPLOYEE);
            verify(userRepository, never()).lockByRoleAndStatus(any(), any());
        }
    }
}
