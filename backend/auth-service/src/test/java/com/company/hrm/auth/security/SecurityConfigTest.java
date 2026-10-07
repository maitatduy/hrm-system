package com.company.hrm.auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    @Test
    void jwtFilterIsNotRegisteredAsAStandaloneServletFilter() {
        JwtAuthenticationFilter filter = mock(JwtAuthenticationFilter.class);
        SecurityConfig config = new SecurityConfig(
                filter, mock(RestAuthenticationEntryPoint.class), mock(RestAccessDeniedHandler.class));

        FilterRegistrationBean<JwtAuthenticationFilter> registration = config.jwtAuthenticationFilterRegistration(filter);

        // Chỉ chạy trong chuỗi filter của Spring Security, không chạy thêm một lần ở tầng servlet
        assertThat(registration.isEnabled()).isFalse();
        assertThat(registration.getFilter()).isSameAs(filter);
    }
}
