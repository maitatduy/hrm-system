package com.company.hrm.auth.service.event;

import com.company.hrm.auth.service.EmailService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Chạy cơ chế event và transaction thật của Spring (không mock publisher) để chứng minh email chỉ được gửi
 * sau khi transaction commit. Transaction manager tối giản không cần database vì chỉ cần vòng đời commit/rollback.
 */
class AccountCreatedEmailListenerTest {

    private AnnotationConfigApplicationContext context;
    private EmailService emailService;
    private AccountCreator accountCreator;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigApplicationContext(TestConfig.class);
        emailService = context.getBean(EmailService.class);
        accountCreator = context.getBean(AccountCreator.class);
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    @Test
    void sendsEmailAfterCommit() {
        accountCreator.create(false);

        verify(emailService).sendAccountCreatedEmailAsync("a@hrm.vn", "Temp#Pass1234567");
    }

    @Test
    void sendsNothingWhenTransactionRollsBack() {
        assertThatThrownBy(() -> accountCreator.create(true)).isInstanceOf(IllegalStateException.class);

        verify(emailService, never()).sendAccountCreatedEmailAsync(anyString(), anyString());
    }

    @Test
    void sendsNothingWhenPublishedOutsideATransaction() {
        context.publishEvent(new AccountCreatedEvent("a@hrm.vn", "Temp#Pass1234567"));

        verifyNoInteractions(emailService);
    }

    /** Mô phỏng AccountServiceImpl.createAccount: phát event trong transaction, có thể lỗi sau khi phát. */
    static class AccountCreator {

        private final ApplicationEventPublisher publisher;

        AccountCreator(ApplicationEventPublisher publisher) {
            this.publisher = publisher;
        }

        @Transactional
        public void create(boolean failAfterPublish) {
            publisher.publishEvent(new AccountCreatedEvent("a@hrm.vn", "Temp#Pass1234567"));
            if (failAfterPublish) {
                throw new IllegalStateException("lưu tài khoản thất bại");
            }
        }
    }

    @Configuration
    @EnableTransactionManagement
    static class TestConfig {

        @Bean
        EmailService emailService() {
            return mock(EmailService.class);
        }

        @Bean
        AccountCreatedEmailListener accountCreatedEmailListener(EmailService emailService) {
            return new AccountCreatedEmailListener(emailService);
        }

        @Bean
        AccountCreator accountCreator(ApplicationEventPublisher publisher) {
            return new AccountCreator(publisher);
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
