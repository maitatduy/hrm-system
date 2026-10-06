package com.company.hrm.auth.dto;

import com.company.hrm.auth.dto.response.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Duration;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenPair {

    private String accessToken;

    private String refreshToken;

    /** Thời gian sống của cookie refresh token, null nghĩa là cookie phiên (mất khi đóng trình duyệt). */
    private Duration refreshTokenCookieMaxAge;

    @Builder.Default
    private String tokenType = "Bearer";

    private UserSummaryResponse user;
}
