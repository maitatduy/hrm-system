package com.company.hrm.auth.dto.response;

import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {

    private UUID id;
    private String email;
    private Role role;
    private UserStatus status;
    private UUID employeeId;
    private LocalDateTime lastLoginAt;
}
