package com.company.hrm.auth.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSummaryDto {

    private UUID id;
    private String fullName;
    private String email;
    private String departmentName;
    private String positionName;
    private String status;
}
