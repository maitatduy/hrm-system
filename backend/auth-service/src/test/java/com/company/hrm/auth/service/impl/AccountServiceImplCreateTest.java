package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.client.EmployeeServiceClient;
import com.company.hrm.auth.dto.request.CreateAccountRequest;
import com.company.hrm.auth.dto.response.AccountResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.exception.ConflictException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.service.TokenService;
import com.company.hrm.auth.service.event.AccountCreatedEvent;
import com.company.hrm.auth.validation.PasswordPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.SQLIntegrityConstraintViolationException;
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
class AccountServiceImplCreateTest {

    private static final UUID EMPLOYEE_ID = UUID.randomUUID();

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
    @Mock
    private TransactionTemplate transactionTemplate;

    @InjectMocks
    private AccountServiceImpl accountService;

    @BeforeEach
    void setUp() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByEmployeeId(EMPLOYEE_ID)).thenReturn(false);
        when(employeeServiceClient.checkEmployeeExists(EMPLOYEE_ID)).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "hash:" + invocation.getArgument(0));
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toAccountResponse(any(User.class))).thenReturn(new AccountResponse());
        // Chạy callback ngay như một transaction thật; ranh giới transaction được kiểm chứng ở AccountCreatedEmailListenerTest
        when(transactionTemplate.execute(any())).thenAnswer(invocation ->
                invocation.<TransactionCallback<?>>getArgument(0).doInTransaction(null));
    }

    private CreateAccountRequest request(String passwordMode, String password) {
        return CreateAccountRequest.builder()
                .employeeId(EMPLOYEE_ID)
                .email("NguyenVanA@hrm.vn")
                .role(Role.EMPLOYEE)
                .passwordMode(passwordMode)
                .password(password)
                .build();
    }

    @Test
    void emailsTheGeneratedPasswordThatWasActuallySaved() {
        accountService.createAccount(request("RANDOM", null));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        ArgumentCaptor<AccountCreatedEvent> eventCaptor = ArgumentCaptor.forClass(AccountCreatedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        AccountCreatedEvent event = eventCaptor.getValue();
        assertThat(event.email()).isEqualTo("nguyenvana@hrm.vn");
        assertThat(event.temporaryPassword()).hasSize(16);
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("hash:" + event.temporaryPassword());
    }

    @Test
    void defaultModeAlsoGeneratesAndEmailsPassword() {
        accountService.createAccount(request("DEFAULT", null));

        verify(eventPublisher).publishEvent(any(AccountCreatedEvent.class));
    }

    @Test
    void manualPasswordIsNotEmailed() {
        accountService.createAccount(request("MANUAL", "Manual#Pass1"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("hash:Manual#Pass1");
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void rejectsWeakManualPasswordEvenWithoutDtoValidation() {
        assertThatThrownBy(() -> accountService.createAccount(request("MANUAL", "12345678")))
                .isInstanceOf(BadRequestException.class)
                .hasMessage(PasswordPolicy.WEAK_MESSAGE);

        verify(userRepository, never()).saveAndFlush(any());
    }

    @Test
    void doesNotEmailWhenValidationFails() {
        assertThatThrownBy(() -> accountService.createAccount(request("MANUAL", "short")))
                .isInstanceOf(BadRequestException.class);

        verify(userRepository, never()).saveAndFlush(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void existingEmailIsAConflict() {
        when(userRepository.existsByEmail("nguyenvana@hrm.vn")).thenReturn(true);

        assertThatThrownBy(() -> accountService.createAccount(request("RANDOM", null)))
                .isInstanceOf(ConflictException.class)
                .hasMessage(AccountServiceImpl.DUPLICATE_EMAIL_MESSAGE);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void employeeWithAccountIsAConflict() {
        when(userRepository.existsByEmployeeId(EMPLOYEE_ID)).thenReturn(true);

        assertThatThrownBy(() -> accountService.createAccount(request("RANDOM", null)))
                .isInstanceOf(ConflictException.class)
                .hasMessage(AccountServiceImpl.DUPLICATE_EMPLOYEE_MESSAGE);
    }

    @Test
    void concurrentDuplicateCaughtByDatabaseIsAConflictAndSendsNoEmail() {
        // Request đồng thời đã vượt qua existsByEmail, ràng buộc unique trong database chặn lại lúc flush
        when(userRepository.saveAndFlush(any(User.class))).thenThrow(new DataIntegrityViolationException(
                "could not execute statement",
                new SQLIntegrityConstraintViolationException("Duplicate entry for key 'uk_users_email'", "23000", 1062)));

        assertThatThrownBy(() -> accountService.createAccount(request("RANDOM", null)))
                .isInstanceOf(ConflictException.class)
                .hasMessage(AccountServiceImpl.DUPLICATE_ACCOUNT_MESSAGE);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void nonUniqueConstraintViolationIsNotReportedAsDuplicate() {
        // NOT NULL hay quá độ dài cột là lỗi của code, để handler chung trả 500 thay vì báo "đã có tài khoản"
        DataIntegrityViolationException notNull = new DataIntegrityViolationException("could not execute statement",
                new SQLIntegrityConstraintViolationException("Column 'role' cannot be null", "23000", 1048));
        when(userRepository.saveAndFlush(any(User.class))).thenThrow(notNull);

        assertThatThrownBy(() -> accountService.createAccount(request("RANDOM", null))).isSameAs(notNull);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void eventNeverPrintsThePassword() {
        AccountCreatedEvent event = new AccountCreatedEvent("a@hrm.vn", "Secret#Pass123");

        assertThat(event.toString()).doesNotContain("Secret#Pass123");
    }
}
