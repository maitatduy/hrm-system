package com.company.hrm.auth.mapper;

import com.company.hrm.auth.dto.response.AccountResponse;
import com.company.hrm.auth.dto.response.UserSummaryResponse;
import com.company.hrm.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    UserSummaryResponse toSummaryResponse(User user);

    @Mapping(target = "employeeName", ignore = true)
    @Mapping(target = "departmentName", ignore = true)
    AccountResponse toAccountResponse(User user);
}
