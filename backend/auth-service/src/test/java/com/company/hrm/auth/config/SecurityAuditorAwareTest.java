package com.company.hrm.auth.config;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityAuditorAwareTest {

    private final SecurityAuditorAware auditorAware = new SecurityAuditorAware();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void usesTheAuthenticatedUserId() {
        String adminId = UUID.randomUUID().toString();
        // Giống JwtAuthenticationFilter: principal là id người dùng, có authority nên đã được xác thực
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                adminId, null, AuthorityUtils.createAuthorityList("ROLE_ADMIN")));

        assertThat(auditorAware.getCurrentAuditor()).contains(adminId);
    }

    @Test
    void usesSystemWhenNobodyIsLoggedIn() {
        assertThat(auditorAware.getCurrentAuditor()).contains(SecurityAuditorAware.SYSTEM_AUDITOR);
    }

    @Test
    void usesSystemForAnonymousRequests() {
        // Endpoint công khai như đặt lại mật khẩu bằng OTP
        SecurityContextHolder.getContext().setAuthentication(new AnonymousAuthenticationToken(
                "key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS")));

        assertThat(auditorAware.getCurrentAuditor()).contains(SecurityAuditorAware.SYSTEM_AUDITOR);
    }
}
