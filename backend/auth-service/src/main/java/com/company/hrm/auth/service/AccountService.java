package com.company.hrm.auth.service;

import com.company.hrm.auth.dto.request.CreateAccountRequest;
import com.company.hrm.auth.dto.response.AccountResponse;
import com.company.hrm.auth.dto.response.PageResponse;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AccountService {

    PageResponse<AccountResponse> getAccounts(Role role, UserStatus status, String keyword, Pageable pageable);

    AccountResponse createAccount(CreateAccountRequest request);

    /** @param actorId ADMIN đang thực hiện thao tác, không được tự hạ quyền chính mình */
    AccountResponse updateRole(UUID actorId, UUID id, Role newRole);

    /** @param actorId ADMIN đang thực hiện thao tác, không được tự khóa chính mình */
    AccountResponse lockAccount(UUID actorId, UUID id);

    AccountResponse unlockAccount(UUID id);
}
