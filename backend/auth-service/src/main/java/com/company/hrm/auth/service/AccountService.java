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

    AccountResponse updateRole(UUID id, Role newRole);

    AccountResponse lockAccount(UUID id);

    AccountResponse unlockAccount(UUID id);
}
