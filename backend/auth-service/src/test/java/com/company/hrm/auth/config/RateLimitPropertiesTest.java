package com.company.hrm.auth.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.MapConfigurationPropertySource;

import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitPropertiesTest {

    private static RateLimitProperties bind(Map<String, String> properties) {
        return new Binder(new MapConfigurationPropertySource(properties))
                .bindOrCreate("app.rate-limit", RateLimitProperties.class);
    }

    @Test
    void defaultsMatchTheDocumentedThresholds() {
        assertThat(bind(Map.of())).isEqualTo(RateLimitProperties.defaults());
    }

    @Test
    void thresholdsCanBeTunedWithoutCodeChanges() {
        // Văn phòng đông người dùng chung một IP: tăng ngưỡng theo IP, các ngưỡng khác giữ mặc định
        RateLimitProperties tuned = bind(Map.of(
                "app.rate-limit.login-ip-max-failures", "100",
                "app.rate-limit.login-ip-window", "10m"
        ));

        assertThat(tuned.loginIpMaxFailures()).isEqualTo(100);
        assertThat(tuned.loginIpWindow()).isEqualTo(Duration.ofMinutes(10));
        assertThat(tuned.loginPairMaxFailures()).isEqualTo(5);
    }
}
