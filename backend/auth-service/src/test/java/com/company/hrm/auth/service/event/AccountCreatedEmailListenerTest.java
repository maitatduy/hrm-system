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
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;

import java.util.UUID;

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
 * Gọi chính {@link AccountServiceImpl#createAccount} qua proxy transaction của Spring, với event publisher và
 * {@code @TransactionalEventListener} thật, để chứng minh email chỉ được gửi sau khi transaction commit.
 * Nếu {@code @Transactional} bị xóa khỏi createAccount, event phát ra ngoài transaction, listener không gửi
 * email và {@link #sendsEmailAfterCommit()} sẽ đỏ.
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
    void sendsNothingWhenTransactionRollsBackAfterEventIsPublished() {
        // Lỗi xảy ra sau khi event đã phát, transaction rollback nên listener không được gọi
        when(userMapper.toAccountResponse(any(User.class))).thenThrow(new IllegalStateException("lỗi sau khi lưu"));

        assertThatThrownBy(() -> accountService.createAccount(randomPasswordRequest()))
                .isInstanceOf(IllegalStateException.class);

        verify(emailService, never()).sendAccountCreatedEmailAsync(anyString(), anyString());
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
                ApplicationEventPublisher eventPublisher
        ) {
            return new AccountServiceImpl(
                    userRepository, userMapper, employeeServiceClient, passwordEncoder, tokenService, eventPublisher);
        }

        @Bean
        AccountCreatedEmailListener accountCreatedEmailListener(EmailService emailService) {
            return new AccountCreatedEmailListener(emailService);
        }

        @Bean
        PlatformTransactionManager transactionManager() {
            return new AbstractPlatformTransactionManager() {
                @Override
                protected Object doGetTransaction() {
                    return new Object();
                }

                @Override
                protected void doBegin(Object transaction, TransactionDefinition definition) {
                }

                @Override
                protected void doCommit(DefaultTransactionStatus status) {
                }

                @Override
                protected void doRollback(DefaultTransactionStatus status) {
                }
            };
        }
    }
}
