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
import com.company.hrm.auth.exception.ConflictException;
import com.company.hrm.auth.exception.DataIntegrityErrors;
import com.company.hrm.auth.exception.ResourceNotFoundException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.security.PasswordGenerator;
import com.company.hrm.auth.service.AccountService;
import com.company.hrm.auth.service.TokenService;
import com.company.hrm.auth.service.event.AccountCreatedEvent;
import com.company.hrm.auth.validation.PasswordPolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    private final ApplicationEventPublisher eventPublisher;
    private final TransactionTemplate transactionTemplate;

    static final String DUPLICATE_EMAIL_MESSAGE = "Email đã được sử dụng bởi một tài khoản khác";
    static final String DUPLICATE_EMPLOYEE_MESSAGE = "Nhân viên này đã được tạo tài khoản trước đó";
    static final String DUPLICATE_ACCOUNT_MESSAGE = "Email hoặc nhân viên này đã có tài khoản";

    /**
     * Không đặt @Transactional: truy vấn trang tự chạy trong transaction của repository, còn việc lấy tên và phòng ban
     * từ employee-service nằm ngoài transaction để không giữ kết nối database trong lúc chờ mạng.
     */
    @Override
    public PageResponse<AccountResponse> getAccounts(Role role, UserStatus status, String keyword, Pageable pageable) {
        Page<User> userPage = userRepository.searchUsers(role, status, keyword, pageable);

        Map<UUID, EmployeeSummaryDto> employees = fetchEmployeeSummaries(userPage.getContent().stream()
                .map(User::getEmployeeId)
                .filter(Objects::nonNull)
                .distinct()
                .toList());
        List<AccountResponse> content = userPage.getContent().stream()
                .map(user -> withEmployeeInfo(userMapper.toAccountResponse(user), employees.get(user.getEmployeeId())))
                .toList();

        return PageResponse.<AccountResponse>builder()
                .content(content)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .isLast(userPage.isLast())
                .build();
    }

    /**
     * Gọi employee-service theo lô, mỗi lần tối đa EmployeeServiceClient.MAX_BATCH_SIZE id. Lỗi thì trả kết quả rỗng
     * để danh sách tài khoản vẫn hiển thị được, chỉ thiếu tên và phòng ban.
     */
    private Map<UUID, EmployeeSummaryDto> fetchEmployeeSummaries(List<UUID> employeeIds) {
        Map<UUID, EmployeeSummaryDto> summaries = new HashMap<>();
        for (int from = 0; from < employeeIds.size(); from += EmployeeServiceClient.MAX_BATCH_SIZE) {
            List<UUID> batch = employeeIds.subList(from, Math.min(from + EmployeeServiceClient.MAX_BATCH_SIZE, employeeIds.size()));
            try {
                List<EmployeeSummaryDto> result = employeeServiceClient.getEmployeeSummaries(batch);
                if (result != null) {
                    result.stream()
                            .filter(summary -> summary.getId() != null)
                            .forEach(summary -> summaries.put(summary.getId(), summary));
                }
            } catch (Exception e) {
                log.warn("Không thể lấy thông tin {} nhân viên: {}", batch.size(), e.getMessage());
            }
        }
        return summaries;
    }

    private static AccountResponse withEmployeeInfo(AccountResponse response, EmployeeSummaryDto summary) {
        if (summary != null) {
            response.setEmployeeName(summary.getFullName());
            response.setDepartmentName(summary.getDepartmentName());
        }
        return response;
    }

    /**
     * Các bước gọi employee-service và băm mật khẩu (BCrypt) chạy ngoài transaction. Chỉ phần lưu tài khoản và phát
     * event nằm trong transaction, nên kết nối database không bị giữ trong lúc chờ mạng hay chờ BCrypt. Listener gửi
     * email vẫn chỉ chạy sau khi transaction đó commit.
     */
    @Override
    public AccountResponse createAccount(CreateAccountRequest request) {
        String email = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException(DUPLICATE_EMAIL_MESSAGE);
        }

        if (request.getEmployeeId() != null) {
            Boolean exists = employeeServiceClient.checkEmployeeExists(request.getEmployeeId());
            if (Boolean.FALSE.equals(exists)) {
                throw new BadRequestException("Nhân viên không tồn tại trong hệ thống");
            }

            if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
                throw new ConflictException(DUPLICATE_EMPLOYEE_MESSAGE);
            }
        }

        // MANUAL: admin tự đặt và tự giao mật khẩu. Các chế độ còn lại: hệ thống sinh mật khẩu và gửi qua email
        boolean manualPassword = "MANUAL".equalsIgnoreCase(request.getPasswordMode());
        String rawPassword;
        if (manualPassword) {
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                throw new BadRequestException("Chế độ MANUAL cần nhập mật khẩu");
            }
            // DTO đã có @StrongPassword, kiểm tra lại ở đây để service an toàn cả khi được gọi không qua controller
            PasswordPolicy.violation(request.getPassword()).ifPresent(message -> {
                throw new BadRequestException(message);
            });
            rawPassword = request.getPassword();
        } else {
            rawPassword = PasswordGenerator.generate();
        }

        User newUser = User.builder()
                .employeeId(request.getEmployeeId())
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = transactionTemplate.execute(status -> {
            User saved;
            try {
                // Flush ngay để lỗi ràng buộc unique xảy ra tại đây chứ không phải lúc commit, khi đã quá muộn để dịch
                // thành 409. Hai request cùng email hoặc cùng nhân viên chạy đồng thời đều vượt qua kiểm tra ở trên.
                saved = userRepository.saveAndFlush(newUser);
            } catch (DataIntegrityViolationException e) {
                // Chỉ trùng khóa unique mới là 409, vi phạm ràng buộc khác là lỗi của code nên để handler chung trả 500
                if (DataIntegrityErrors.isUniqueViolation(e)) {
                    throw new ConflictException(DUPLICATE_ACCOUNT_MESSAGE);
                }
                throw e;
            }
            if (!manualPassword) {
                // Listener chỉ gửi email sau khi transaction commit, mật khẩu không bao giờ nằm trong response
                eventPublisher.publishEvent(new AccountCreatedEvent(email, rawPassword));
            }
            return saved;
        });

        AccountResponse response = userMapper.toAccountResponse(savedUser);
        if (savedUser.getEmployeeId() != null) {
            try {
                withEmployeeInfo(response, employeeServiceClient.getEmployeeSummary(savedUser.getEmployeeId()));
            } catch (Exception e) {
                log.warn("Không thể lấy thông tin nhân viên {}: {}", savedUser.getEmployeeId(), e.getMessage());
            }
        }
        return response;
    }

    @Override
    @Transactional
    public AccountResponse updateRole(UUID actorId, UUID id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với id: " + id));

        if (user.getRole() == newRole) {
            return userMapper.toAccountResponse(user);
        }
        if (id.equals(actorId)) {
            throw new BadRequestException("Không thể tự thay đổi vai trò của chính mình");
        }
        if (newRole != Role.ADMIN) {
            ensureAnotherActiveAdminRemains(user);
        }

        user.setRole(newRole);
        User savedUser = userRepository.save(user);

        tokenService.revokeAllUserTokens(user.getId().toString());

        return userMapper.toAccountResponse(savedUser);
    }

    @Override
    @Transactional
    public AccountResponse lockAccount(UUID actorId, UUID id) {
        if (id.equals(actorId)) {
            throw new BadRequestException("Không thể tự khóa tài khoản của chính mình");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với id: " + id));

        ensureAnotherActiveAdminRemains(user);

        user.setStatus(UserStatus.LOCKED);
        User savedUser = userRepository.save(user);

        tokenService.revokeAllUserTokens(user.getId().toString());

        return userMapper.toAccountResponse(savedUser);
    }

    /**
     * Thao tác sắp loại {@code target} khỏi nhóm ADMIN đang hoạt động thì phải còn ít nhất một ADMIN khác.
     * Các dòng ADMIN được khóa tới hết transaction nên hai thao tác đồng thời không cùng vượt qua kiểm tra.
     */
    private void ensureAnotherActiveAdminRemains(User target) {
        if (target.getRole() != Role.ADMIN || target.getStatus() != UserStatus.ACTIVE) {
            return;
        }
        List<User> activeAdmins = userRepository.lockByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
        boolean anotherAdminRemains = activeAdmins.stream().anyMatch(admin -> !admin.getId().equals(target.getId()));
        if (!anotherAdminRemains) {
            throw new ConflictException("Hệ thống phải còn ít nhất một quản trị viên đang hoạt động");
        }
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
