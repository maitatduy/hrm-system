package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.config.AsyncConfig;
import com.company.hrm.auth.service.EmailService;
import com.company.hrm.auth.service.TokenService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Gửi email qua SMTP. Không bao giờ ghi mã OTP hay mật khẩu ra log, email người nhận được che bớt khi log.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    static final String OTP_SUBJECT = "Mã xác thực HRM System";
    static final String ACCOUNT_CREATED_SUBJECT = "Tài khoản HRM System của bạn";
    private static final String OTP_TEMPLATE = "mail/otp-code";
    private static final String ACCOUNT_CREATED_TEMPLATE = "mail/account-created";
    private static final int MAX_SEND_ATTEMPTS = 3;

    private final JavaMailSender mailSender;
    private final ITemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.mail.retry-backoff-ms:2000}")
    private long retryBackoffMs;

    @Async(AsyncConfig.MAIL_TASK_EXECUTOR)
    @Override
    public CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp) {
        long validityMinutes = TokenService.OTP_TTL.toMinutes();
        String text = """
                Mã xác thực HRM System của bạn là: %s

                Mã có hiệu lực trong %d phút. Không chia sẻ mã này với bất kỳ ai.
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                """.formatted(otp, validityMinutes);

        return sendWithRetry(new MailContent(
                "email OTP",
                toEmail,
                OTP_SUBJECT,
                OTP_TEMPLATE,
                Map.of("otp", otp, "validityMinutes", validityMinutes),
                text
        ));
    }

    @Async(AsyncConfig.MAIL_TASK_EXECUTOR)
    @Override
    public CompletableFuture<Void> sendAccountCreatedEmailAsync(String toEmail, String temporaryPassword) {
        String text = """
                Tài khoản HRM System của bạn đã được tạo.

                Email đăng nhập: %s
                Mật khẩu tạm thời: %s

                Hãy đăng nhập và đổi mật khẩu ngay trong mục Cài đặt. Không chia sẻ mật khẩu này với bất kỳ ai.
                Nếu bạn không mong đợi email này, hãy liên hệ bộ phận Nhân sự.
                """.formatted(toEmail, temporaryPassword);

        return sendWithRetry(new MailContent(
                "email tạo tài khoản",
                toEmail,
                ACCOUNT_CREATED_SUBJECT,
                ACCOUNT_CREATED_TEMPLATE,
                Map.of("email", toEmail, "temporaryPassword", temporaryPassword),
                text
        ));
    }

    /** Nội dung một email, {@code kind} chỉ dùng để ghi log, không chứa dữ liệu nhạy cảm. */
    private record MailContent(
            String kind,
            String toEmail,
            String subject,
            String template,
            Map<String, Object> variables,
            String plainText
    ) {
    }

    private CompletableFuture<Void> sendWithRetry(MailContent content) {
        String maskedEmail = maskEmail(content.toEmail());

        for (int attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
            try {
                mailSender.send(buildMessage(content));
                log.info("Đã gửi {} tới {}", content.kind(), maskedEmail);
                return CompletableFuture.completedFuture(null);
            } catch (MailException | MessagingException | UnsupportedEncodingException e) {
                log.warn("Gửi {} tới {} thất bại lần {}/{}: {}",
                        content.kind(), maskedEmail, attempt, MAX_SEND_ATTEMPTS, e.getMessage());
                if (attempt == MAX_SEND_ATTEMPTS) {
                    log.error("Bỏ qua gửi {} tới {} sau {} lần thử", content.kind(), maskedEmail, MAX_SEND_ATTEMPTS);
                    return CompletableFuture.failedFuture(e);
                }
                if (!waitBeforeRetry(attempt)) {
                    return CompletableFuture.failedFuture(e);
                }
            }
        }
        return CompletableFuture.completedFuture(null);
    }

    private MimeMessage buildMessage(MailContent content) throws MessagingException, UnsupportedEncodingException {
        Context context = new Context(Locale.forLanguageTag("vi"));
        context.setVariables(content.variables());
        String html = templateEngine.process(content.template(), context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        helper.setFrom(fromAddress, fromName);
        helper.setTo(content.toEmail());
        helper.setSubject(content.subject());
        helper.setText(content.plainText(), html);
        return message;
    }

    /** Chờ tăng dần giữa các lần thử lại. Trả về false nếu luồng bị ngắt. */
    private boolean waitBeforeRetry(int attempt) {
        try {
            Thread.sleep(retryBackoffMs * attempt);
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private static String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***" + email.substring(Math.max(atIndex, 0));
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
