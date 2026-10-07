package com.company.hrm.auth.service.impl;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

/** Hành vi đếm chạy với Redis thật trong RateLimitServiceImplRedisTest, ở đây chỉ còn phần không cần Redis. */
class RateLimitServiceImplTest {

    @Test
    void humanizesWindowsForMessages() {
        assertThat(RateLimitServiceImpl.humanize(Duration.ofSeconds(60))).isEqualTo("60 giây");
        assertThat(RateLimitServiceImpl.humanize(Duration.ofMinutes(15))).isEqualTo("15 phút");
        assertThat(RateLimitServiceImpl.humanize(Duration.ofMinutes(90))).isEqualTo("90 phút");
        assertThat(RateLimitServiceImpl.humanize(Duration.ofHours(1))).isEqualTo("1 giờ");
    }
}
