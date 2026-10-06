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
import java.util.concurrent.CompletableFuture;

/**
 * Gửi email OTP qua SMTP. Không bao giờ ghi mã OTP ra log, email người nhận được che bớt khi log.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    static final String OTP_SUBJECT = "Mã xác thực HRM System";
    private static final String OTP_TEMPLATE = "mail/otp-code";
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
        String maskedEmail = maskEmail(toEmail);

        for (int attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
            try {
                mailSender.send(buildOtpMessage(toEmail, otp));
                log.info("Đã gửi email OTP tới {}", maskedEmail);
                return CompletableFuture.completedFuture(null);
            } catch (MailException | MessagingException | UnsupportedEncodingException e) {
                log.warn("Gửi email OTP tới {} thất bại lần {}/{}: {}",
                        maskedEmail, attempt, MAX_SEND_ATTEMPTS, e.getMessage());
                if (attempt == MAX_SEND_ATTEMPTS) {
                    log.error("Bỏ qua gửi email OTP tới {} sau {} lần thử", maskedEmail, MAX_SEND_ATTEMPTS);
                    return CompletableFuture.failedFuture(e);
                }
                if (!waitBeforeRetry(attempt)) {
                    return CompletableFuture.failedFuture(e);
                }
            }
        }
        return CompletableFuture.completedFuture(null);
    }

    private MimeMessage buildOtpMessage(String toEmail, String otp)
            throws MessagingException, UnsupportedEncodingException {
        long validityMinutes = TokenService.OTP_TTL.toMinutes();

        Context context = new Context(Locale.forLanguageTag("vi"));
        context.setVariable("otp", otp);
        context.setVariable("validityMinutes", validityMinutes);
        String html = templateEngine.process(OTP_TEMPLATE, context);
        String text = """
                Mã xác thực HRM System của bạn là: %s

                Mã có hiệu lực trong %d phút. Không chia sẻ mã này với bất kỳ ai.
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                """.formatted(otp, validityMinutes);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        helper.setFrom(fromAddress, fromName);
        helper.setTo(toEmail);
        helper.setSubject(OTP_SUBJECT);
        helper.setText(text, html);
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
