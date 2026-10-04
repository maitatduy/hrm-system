package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.client.EmployeeServiceClient;
import com.company.hrm.auth.client.dto.EmployeeSummaryDto;
import com.company.hrm.auth.dto.request.CreateAccountRequest;
import com.company.hrm.auth.dto.response.AccountResponse;
import com.company.hrm.auth.dto.response.PageResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.exception.ResourceNotFoundException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.service.AccountService;
import com.company.hrm.auth.service.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final EmployeeServiceClient employeeServiceClient;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccountResponse> getAccounts(Role role, UserStatus status, String keyword, Pageable pageable) {
        Page<User> userPage = userRepository.searchUsers(role, status, keyword, pageable);

        List<AccountResponse> content = userPage.getContent().stream().map(user -> {
            AccountResponse response = userMapper.toAccountResponse(user);
            if (user.getEmployeeId() != null) {
                try {
                    EmployeeSummaryDto summary = employeeServiceClient.getEmployeeSummary(user.getEmployeeId());
                    if (summary != null) {
                        response.setEmployeeName(summary.getFullName());
                        response.setDepartmentName(summary.getDepartmentName());
                    }
                } catch (Exception e) {
                    log.warn("Không thể lấy thông tin nhân viên {}: {}", user.getEmployeeId(), e.getMessage());
                }
            }
            return response;
        }).toList();

        return PageResponse.<AccountResponse>builder()
                .content(content)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .isLast(userPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        String email = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã được sử dụng bởi một tài khoản khác");
        }

        if (request.getEmployeeId() != null) {
            Boolean exists = employeeServiceClient.checkEmployeeExists(request.getEmployeeId());
            if (Boolean.FALSE.equals(exists)) {
                throw new BadRequestException("Nhân viên không tồn tại trong hệ thống");
            }

            if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
                throw new BadRequestException("Nhân viên này đã được tạo tài khoản trước đó");
            }
        }

        String rawPassword;
        if ("RANDOM".equalsIgnoreCase(request.getPasswordMode())) {
            rawPassword = UUID.randomUUID().toString().substring(0, 10);
        } else if ("MANUAL".equalsIgnoreCase(request.getPasswordMode())) {
            if (request.getPassword() == null || request.getPassword().length() < 8) {
                throw new BadRequestException("Mật khẩu thủ công phải có độ dài tối thiểu 8 ký tự");
            }
            rawPassword = request.getPassword();
        } else {
            rawPassword = "Hrm@" + UUID.randomUUID().toString().substring(0, 6);
        }

        User newUser = User.builder()
                .employeeId(request.getEmployeeId())
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(newUser);
        AccountResponse response = userMapper.toAccountResponse(savedUser);

        if (savedUser.getEmployeeId() != null) {
            try {
                EmployeeSummaryDto summary = employeeServiceClient.getEmployeeSummary(savedUser.getEmployeeId());
                if (summary != null) {
                    response.setEmployeeName(summary.getFullName());
                    response.setDepartmentName(summary.getDepartmentName());
                }
            } catch (Exception e) {
                log.warn("Không thể lấy thông tin nhân viên {}: {}", savedUser.getEmployeeId(), e.getMessage());
            }
        }

        return response;
    }

    @Override
    @Transactional
    public AccountResponse updateRole(UUID id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với id: " + id));

        user.setRole(newRole);
        User savedUser = userRepository.save(user);

        tokenService.revokeAllUserTokens(user.getId().toString());

        return userMapper.toAccountResponse(savedUser);
    }

    @Override
    @Transactional
    public AccountResponse lockAccount(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với id: " + id));

        user.setStatus(UserStatus.LOCKED);
        User savedUser = userRepository.save(user);

        tokenService.revokeAllUserTokens(user.getId().toString());

        return userMapper.toAccountResponse(savedUser);
    }

    @Override
    @Transactional
    public AccountResponse unlockAccount(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với id: " + id));

        user.setStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        return userMapper.toAccountResponse(savedUser);
    }
}
