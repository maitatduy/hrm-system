package com.company.hrm.auth.client;

import com.company.hrm.auth.client.dto.EmployeeSummaryDto;
import com.company.hrm.auth.client.fallback.EmployeeServiceClientFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
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

    /**
     * Lấy thông tin rút gọn của nhiều nhân viên trong một lần gọi, dùng cho danh sách tài khoản để không gọi
     * employee-service một lần cho mỗi dòng. Body là danh sách id, tối đa {@value #MAX_BATCH_SIZE} id mỗi lần;
     * nhân viên không tồn tại thì không có trong kết quả.
     */
    @PostMapping("/api/employees/summaries")
    List<EmployeeSummaryDto> getEmployeeSummaries(@RequestBody List<UUID> ids);

    int MAX_BATCH_SIZE = 100;
}
