package com.company.hrm.auth.service;

import java.util.concurrent.CompletableFuture;

public interface EmailService {

    CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp);
}
