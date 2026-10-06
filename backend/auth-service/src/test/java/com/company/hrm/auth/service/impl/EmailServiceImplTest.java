package com.company.hrm.auth.service.impl;

import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.icegreen.greenmail.util.ServerSetupTest;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.util.concurrent.CompletableFuture;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailServiceImplTest {

    private static final String RECIPIENT = "nguyenvana@hrm.vn";
    private static final String OTP = "482913";

    private static SpringTemplateEngine templateEngine() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(resolver);
        return engine;
    }

    private static EmailServiceImpl emailService(JavaMailSender mailSender) {
        EmailServiceImpl service = new EmailServiceImpl(mailSender, templateEngine());
        ReflectionTestUtils.setField(service, "fromAddress", "no-reply@hrm.local");
        ReflectionTestUtils.setField(service, "fromName", "HRM System");
        ReflectionTestUtils.setField(service, "retryBackoffMs", 0L);
        return service;
    }

    @Nested
    class WithSmtpServer {

        @RegisterExtension
        final GreenMailExtension greenMail = new GreenMailExtension(ServerSetupTest.SMTP);

        @Test
        void sendsOtpEmailWithHtmlAndPlainText() throws Exception {
            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            mailSender.setHost("localhost");
            mailSender.setPort(greenMail.getSmtp().getPort());

            emailService(mailSender).sendOtpEmailAsync(RECIPIENT, OTP).get();

            MimeMessage[] received = greenMail.getReceivedMessages();
            assertThat(received).hasSize(1);
            MimeMessage message = received[0];
            assertThat(message.getSubject()).isEqualTo(EmailServiceImpl.OTP_SUBJECT);
            assertThat(message.getAllRecipients()[0].toString()).isEqualTo(RECIPIENT);
            assertThat(message.getFrom()[0].toString()).contains("no-reply@hrm.local");

            String body = GreenMailUtil.getBody(message);
            assertThat(body).contains(OTP).contains("5 ph");
            assertThat(body).contains("text/plain").contains("text/html");
        }
    }

    @Nested
    class Retry {

        @Test
        void retriesTransientFailuresAndSucceeds() throws Exception {
            JavaMailSender mailSender = mock(JavaMailSender.class);
            when(mailSender.createMimeMessage()).thenAnswer(invocation -> new JavaMailSenderImpl().createMimeMessage());
            doThrow(new MailSendException("SMTP tạm thời lỗi"))
                    .doThrow(new MailSendException("SMTP tạm thời lỗi"))
                    .doNothing()
                    .when(mailSender).send(any(MimeMessage.class));

            CompletableFuture<Void> result = emailService(mailSender).sendOtpEmailAsync(RECIPIENT, OTP);

            assertThat(result).isCompleted().isNotCompletedExceptionally();
            verify(mailSender, times(3)).send(any(MimeMessage.class));
        }

        @Test
        void givesUpAfterThreeFailedAttempts() {
            JavaMailSender mailSender = mock(JavaMailSender.class);
            when(mailSender.createMimeMessage()).thenAnswer(invocation -> new JavaMailSenderImpl().createMimeMessage());
            doThrow(new MailSendException("SMTP không phản hồi")).when(mailSender).send(any(MimeMessage.class));

            CompletableFuture<Void> result = emailService(mailSender).sendOtpEmailAsync(RECIPIENT, OTP);

            assertThat(result).isCompletedExceptionally();
            verify(mailSender, times(3)).send(any(MimeMessage.class));
        }

        @Test
        void sendsOnceWhenFirstAttemptSucceeds() {
            JavaMailSender mailSender = mock(JavaMailSender.class);
            when(mailSender.createMimeMessage()).thenAnswer(invocation -> new JavaMailSenderImpl().createMimeMessage());
            doNothing().when(mailSender).send(any(MimeMessage.class));

            emailService(mailSender).sendOtpEmailAsync(RECIPIENT, OTP);

            verify(mailSender, times(1)).send(any(MimeMessage.class));
        }
    }
}
