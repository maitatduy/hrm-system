package com.company.hrm.auth.repository;

import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(UUID employeeId);

    boolean existsByRoleAndStatus(Role role, UserStatus status);

    /**
     * Ghi thời điểm đăng nhập mà không đổi updated_at, updated_by: đăng nhập không phải là sửa tài khoản, và chưa có ai
     * trong SecurityContext nên auditing sẽ ghi đè người sửa thật bằng "system". JPQL UPDATE không qua entity listener;
     * gán updated_at bằng chính nó để MySQL không tự cập nhật cột này (ON UPDATE CURRENT_TIMESTAMP trong migration V1).
     */
    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :lastLoginAt, u.updatedAt = u.updatedAt WHERE u.id = :id")
    int updateLastLoginAt(@Param("id") UUID id, @Param("lastLoginAt") LocalDateTime lastLoginAt);

    /**
     * Khóa các dòng tìm được tới hết transaction (SELECT ... FOR UPDATE), để hai thao tác đồng thời không cùng
     * thấy "vẫn còn quản trị viên khác" rồi cùng loại bỏ quản trị viên cuối cùng.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = :status")
    List<User> lockByRoleAndStatus(@Param("role") Role role, @Param("status") UserStatus status);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchUsers(
            @Param("role") Role role,
            @Param("status") UserStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
