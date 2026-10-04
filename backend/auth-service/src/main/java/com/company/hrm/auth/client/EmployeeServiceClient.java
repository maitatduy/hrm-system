package com.company.hrm.auth.client;

import com.company.hrm.auth.client.dto.EmployeeSummaryDto;
import com.company.hrm.auth.client.fallback.EmployeeServiceClientFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(
    name = "employee-service",
    fallback = EmployeeServiceClientFallback.class
)
public interface EmployeeServiceClient {

    @GetMapping("/api/employees/{id}/summary")
    EmployeeSummaryDto getEmployeeSummary(@PathVariable("id") UUID id);

    @GetMapping("/api/employees/{id}/exists")
    Boolean checkEmployeeExists(@PathVariable("id") UUID id);
}
