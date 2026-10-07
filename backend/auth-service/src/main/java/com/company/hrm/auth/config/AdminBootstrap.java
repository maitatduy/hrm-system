package com.company.hrm.auth.config;

import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.validation.PasswordPolicy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Tạo tài khoản ADMIN khi hệ thống không còn ADMIN đang hoạt động nào, từ {@code BOOTSTRAP_ADMIN_EMAIL} và
 * {@code BOOTSTRAP_ADMIN_PASSWORD}. Chỉ ADMIN mới tạo được tài khoản, nên thiếu bước này thì hệ thống mới
 * dựng lên không ai đăng nhập được.
 * <p>
 * Đã có ADMIN thì bỏ qua hoàn toàn, không ghi đè mật khẩu, nên có thể xóa hai biến này sau lần chạy đầu.
 */
@Slf4j
@Component
public class AdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public AdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.email:}") String email,
            @Value("${app.bootstrap.admin.password:}") String password
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Chỉ tính ADMIN đang hoạt động: ADMIN duy nhất bị khóa cũng là hệ thống không còn ai quản trị
        if (userRepository.existsByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE)) {
            log.info("Đã có tài khoản ADMIN đang hoạt động, bỏ qua bước tạo ADMIN đầu tiên");
            return;
        }

        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            log.warn("Chưa có tài khoản ADMIN đang hoạt động nào và chưa cấu hình BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD. "
                    + "Không ai đăng nhập để tạo tài khoản được cho tới khi cấu hình hai biến này.");
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        // Cấu hình sai thì dừng khởi động thay vì tạo một ADMIN không đăng nhập được hoặc mật khẩu yếu
        if (!normalizedEmail.contains("@")) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_EMAIL không phải email hợp lệ");
        }
        PasswordPolicy.violation(password).ifPresent(message -> {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_PASSWORD không hợp lệ: " + message);
        });
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_EMAIL đã thuộc về một tài khoản có sẵn, "
                    + "hãy dùng email khác, hoặc mở khóa hay nâng quyền tài khoản đó trực tiếp trong database");
        }

        User admin = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        try {
            userRepository.save(admin);
            log.info("Đã tạo tài khoản ADMIN đầu tiên {}. Hãy đăng nhập, đổi mật khẩu và xóa BOOTSTRAP_ADMIN_PASSWORD "
                    + "khỏi môi trường.", normalizedEmail);
        } catch (DataIntegrityViolationException e) {
            // Nhiều instance khởi động cùng lúc: instance khác đã tạo trước, ràng buộc unique email chặn bản trùng
            log.info("Tài khoản ADMIN đầu tiên đã được instance khác tạo, bỏ qua");
        }
    }
}
