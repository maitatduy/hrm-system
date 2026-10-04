package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Async
    @Override
    public CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp) {
        log.info("Bắt đầu gửi email chứa mã OTP đến: {}", toEmail);
        try {
            log.info("Mã OTP cho tài khoản [{}] là: [{}]. Hiệu lực trong 5 phút.", toEmail, otp);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email OTP đến {}: {}", toEmail, e.getMessage());
            return CompletableFuture.failedFuture(e);
        }
    }
}
