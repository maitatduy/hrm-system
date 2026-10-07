package com.company.hrm.auth.client.fallback;

import com.company.hrm.auth.client.EmployeeServiceClient;
import com.company.hrm.auth.client.dto.EmployeeSummaryDto;
import com.company.hrm.auth.exception.ServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
public class EmployeeServiceClientFallback implements EmployeeServiceClient {

    @Override
    public EmployeeSummaryDto getEmployeeSummary(UUID id) {
        log.warn("Employee-service không phản hồi khi lấy thông tin nhân viên {}. Sử dụng fallback mặc định.", id);
        return EmployeeSummaryDto.builder()
                .id(id)
                .fullName("N/A")
                .departmentName("N/A")
                .build();
    }

    @Override
    public Boolean checkEmployeeExists(UUID id) {
        log.error("Employee-service không phản hồi khi kiểm tra nhân viên {}. Fail-closed: ném ngoại lệ dịch vụ không sẵn sàng.", id);
        throw new ServiceUnavailableException("Không thể xác minh thông tin nhân viên vào lúc này. Vui lòng thử lại sau.");
    }

    /** Danh sách tài khoản vẫn hiển thị được khi employee-service lỗi, chỉ thiếu tên và phòng ban. */
    @Override
    public List<EmployeeSummaryDto> getEmployeeSummaries(List<UUID> ids) {
        log.warn("Employee-service không phản hồi khi lấy thông tin {} nhân viên. Sử dụng fallback mặc định.", ids.size());
        return ids.stream()
                .map(id -> EmployeeSummaryDto.builder().id(id).fullName("N/A").departmentName("N/A").build())
                .toList();
    }
}
