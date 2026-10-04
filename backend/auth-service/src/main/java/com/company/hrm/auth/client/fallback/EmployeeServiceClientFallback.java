package com.company.hrm.auth.client.fallback;

import com.company.hrm.auth.client.EmployeeServiceClient;
import com.company.hrm.auth.client.dto.EmployeeSummaryDto;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class EmployeeServiceClientFallback implements EmployeeServiceClient {

    @Override
    public EmployeeSummaryDto getEmployeeSummary(UUID id) {
        return EmployeeSummaryDto.builder()
                .id(id)
                .fullName("N/A")
                .departmentName("N/A")
                .build();
    }

    @Override
    public Boolean checkEmployeeExists(UUID id) {
        return true;
    }
}
