package com.company.hrm.auth.service.event;

import com.company.hrm.auth.client.EmployeeServiceClient;
import com.company.hrm.auth.dto.request.CreateAccountRequest;
import com.company.hrm.auth.dto.response.AccountResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.service.AccountService;
import com.company.hrm.auth.service.EmailService;
import com.company.hrm.auth.service.TokenService;
import com.company.hrm.auth.service.impl.AccountServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Gọi chính {@link AccountServiceImpl#createAccount} với TransactionTemplate, event publisher và
 * {@code @TransactionalEventListener} thật, để chứng minh email chỉ được gửi sau khi transaction commit, và các bước
 * chậm (gọi employee-service, BCrypt) nằm ngoài transaction. Nếu bước lưu và phát event bị đưa ra khỏi
 * TransactionTemplate, event phát ra ngoài transaction, listener không gửi email và {@link #sendsEmailAfterCommit()}
 * sẽ đỏ.
 * <p>
 * Transaction manager tối giản không cần database vì chỉ cần vòng đời commit/rollback. Việc ghi dữ liệu thật
 * vào MySQL trong cùng transaction thuộc phạm vi test tích hợp {@code @SpringBootTest}.
 */
class AccountCreatedEmailListenerTest {

    private static final UUID EMPLOYEE_ID = UUID.randomUUID();
    private static final String EMAIL = "nguyenvana@hrm.vn";

    private AnnotationConfigApplicationContext context;
    private AccountService accountService;
    private EmailService emailService;
    private UserMapper userMapper;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigApplicationContext(TestConfig.class);
        accountService = context.getBean(AccountService.class);
        emailService = context.getBean(EmailService.class);
        userMapper = context.getBean(UserMapper.class);

        UserRepository userRepository = context.getBean(UserRepository.class);
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(context.getBean(EmployeeServiceClient.class).checkEmployeeExists(EMPLOYEE_ID)).thenReturn(true);
        when(context.getBean(PasswordEncoder.class).encode(anyString())).thenReturn("hashed");
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    private CreateAccountRequest randomPasswordRequest() {
        return CreateAccountRequest.builder()
                .employeeId(EMPLOYEE_ID)
                .email(EMAIL)
                .role(Role.EMPLOYEE)
                .passwordMode("RANDOM")
                .build();
    }

    @Test
    void sendsEmailAfterCommit() {
        when(userMapper.toAccountResponse(any(User.class))).thenReturn(new AccountResponse());

        accountService.createAccount(randomPasswordRequest());

        verify(emailService).sendAccountCreatedEmailAsync(eq(EMAIL), anyString());
    }

    @Test
    void sendsNothingWhenTheCommitFailsAfterEventIsPublished() {
        // Event đã phát trong transaction nhưng commit thất bại (ví dụ database lỗi lúc commit): không gửi email
        when(userMapper.toAccountResponse(any(User.class))).thenReturn(new AccountResponse());
        context.getBean(SwitchableTransactionManager.class).failNextCommit();

        assertThatThrownBy(() -> accountService.createAccount(randomPasswordRequest()))
                .isInstanceOf(TransactionSystemException.class);

        verify(emailService, never()).sendAccountCreatedEmailAsync(anyString(), anyString());
    }

    @Test
    void remoteCallsAndPasswordHashingRunOutsideTheTransaction() {
        // Gọi employee-service hay chạy BCrypt trong transaction là giữ kết nối database suốt thời gian chờ
        List<String> calledInsideTransaction = new ArrayList<>();
        EmployeeServiceClient employeeClient = context.getBean(EmployeeServiceClient.class);
        when(employeeClient.checkEmployeeExists(EMPLOYEE_ID)).thenAnswer(invocation -> {
            recordIfInsideTransaction(calledInsideTransaction, "checkEmployeeExists");
            return true;
        });
        when(employeeClient.getEmployeeSummary(EMPLOYEE_ID)).thenAnswer(invocation -> {
            recordIfInsideTransaction(calledInsideTransaction, "getEmployeeSummary");
            return null;
        });
        when(context.getBean(PasswordEncoder.class).encode(anyString())).thenAnswer(invocation -> {
            recordIfInsideTransaction(calledInsideTransaction, "passwordEncoder.encode");
            return "hashed";
        });
        when(context.getBean(UserRepository.class).saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            // Ngược lại, bước lưu phải nằm trong transaction
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isTrue();
            return invocation.getArgument(0);
        });
        when(userMapper.toAccountResponse(any(User.class))).thenReturn(new AccountResponse());

        accountService.createAccount(randomPasswordRequest());

        assertThat(calledInsideTransaction).isEmpty();
        verify(employeeClient).getEmployeeSummary(EMPLOYEE_ID);
    }

    private static void recordIfInsideTransaction(List<String> calls, String name) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            calls.add(name);
        }
    }

    @Test
    void sendsNothingWhenPublishedOutsideATransaction() {
        context.publishEvent(new AccountCreatedEvent(EMAIL, "Temp#Pass1234567"));

        verifyNoInteractions(emailService);
    }

    @Configuration
    @EnableTransactionManagement
    static class TestConfig {

        @Bean
        UserRepository userRepository() {
            return mock(UserRepository.class);
        }

        @Bean
        UserMapper userMapper() {
            return mock(UserMapper.class);
        }

        @Bean
        EmployeeServiceClient employeeServiceClient() {
            return mock(EmployeeServiceClient.class);
        }

        @Bean
        PasswordEncoder passwordEncoder() {
            return mock(PasswordEncoder.class);
        }

        @Bean
        TokenService tokenService() {
            return mock(TokenService.class);
        }

        @Bean
        EmailService emailService() {
            return mock(EmailService.class);
        }

        @Bean
        AccountService accountService(
                UserRepository userRepository,
                UserMapper userMapper,
                EmployeeServiceClient employeeServiceClient,
                PasswordEncoder passwordEncoder,
                TokenService tokenService,
                ApplicationEventPublisher eventPublisher,
                PlatformTransactionManager transactionManager
        ) {
            return new AccountServiceImpl(userRepository, userMapper, employeeServiceClient, passwordEncoder,
                    tokenService, eventPublisher, new TransactionTemplate(transactionManager));
        }

        @Bean
        AccountCreatedEmailListener accountCreatedEmailListener(EmailService emailService) {
            return new AccountCreatedEmailListener(emailService);
        }

        @Bean
        SwitchableTransactionManager transactionManager() {
            return new SwitchableTransactionManager();
        }
    }

    /** Transaction manager tối giản không cần database, có thể cho lần commit kế tiếp thất bại. */
    static class SwitchableTransactionManager extends AbstractPlatformTransactionManager {

        private boolean failNextCommit;

        void failNextCommit() {
            failNextCommit = true;
        }

        @Override
        protected Object doGetTransaction() {
            return new Object();
        }

        @Override
        protected void doBegin(Object transaction, TransactionDefinition definition) {
        }

        @Override
        protected void doCommit(DefaultTransactionStatus status) {
            if (failNextCommit) {
                failNextCommit = false;
                throw new TransactionSystemException("commit thất bại");
            }
        }

        @Override
        protected void doRollback(DefaultTransactionStatus status) {
        }
    }
}
