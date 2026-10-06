package com.company.hrm.auth.controller;

import com.company.hrm.auth.dto.request.CreateAccountRequest;
import com.company.hrm.auth.dto.request.UpdateRoleRequest;
import com.company.hrm.auth.dto.response.AccountResponse;
import com.company.hrm.auth.dto.response.ApiResponse;
import com.company.hrm.auth.dto.response.PageResponse;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "Các API quản lý tài khoản người dùng dành riêng cho ADMIN")
public class AccountController {

    private static final Set<String> SORTABLE_FIELDS = Set.of("createdAt", "email", "role", "status", "lastLoginAt");
    private static final int MAX_PAGE_SIZE = 100;

    private final AccountService accountService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách tài khoản", description = "Truy vấn danh sách tài khoản có phân trang, lọc theo vai trò, trạng thái và từ khóa email")
    public ResponseEntity<ApiResponse<PageResponse<AccountResponse>>> getAccounts(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        if (!SORTABLE_FIELDS.contains(sortBy)) {
            throw new BadRequestException("Không hỗ trợ sắp xếp theo trường: " + sortBy);
        }
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE), sort);
        PageResponse<AccountResponse> response = accountService.getAccounts(role, status, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo tài khoản mới", description = "Tạo tài khoản người dùng gắn với nhân viên, kiểm tra nhân viên tồn tại qua employee-service")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody CreateAccountRequest request
    ) {
        AccountResponse response = accountService.createAccount(request);
        return new ResponseEntity<>(ApiResponse.created("Tạo tài khoản thành công", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật vai trò người dùng", description = "Thay đổi vai trò của người dùng và thu hồi các phiên đăng nhập cũ")
    public ResponseEntity<ApiResponse<AccountResponse>> updateRole(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        AccountResponse response = accountService.updateRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò thành công", response));
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Khóa tài khoản", description = "Khóa tài khoản người dùng và thu hồi toàn bộ token đăng nhập ngay lập tức")
    public ResponseEntity<ApiResponse<AccountResponse>> lockAccount(
            @PathVariable("id") UUID id
    ) {
        AccountResponse response = accountService.lockAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Khóa tài khoản thành công", response));
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mở khóa tài khoản", description = "Mở khóa tài khoản người dùng trở lại trạng thái ACTIVE")
    public ResponseEntity<ApiResponse<AccountResponse>> unlockAccount(
            @PathVariable("id") UUID id
    ) {
        AccountResponse response = accountService.unlockAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Mở khóa tài khoản thành công", response));
    }
}
