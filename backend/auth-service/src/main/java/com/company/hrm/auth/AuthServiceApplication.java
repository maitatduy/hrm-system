package com.company.hrm.auth;

import com.company.hrm.auth.config.RateLimitProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.TimeZone;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableAsync
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@EnableConfigurationProperties(RateLimitProperties.class)
public class AuthServiceApplication {

    public static void main(String[] args) {
        // Mọi thời gian ở backend lưu và trả về theo UTC, frontend tự chuyển sang múi giờ người dùng
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
