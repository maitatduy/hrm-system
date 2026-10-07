package com.company.hrm.auth.dto.request;

import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.validation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {

    @NotNull(message = "Mã nhân viên không được để trống")
    private UUID employeeId;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotNull(message = "Vai trò không được để trống")
    private Role role;

    @NotBlank(message = "Chế độ mật khẩu không được để trống")
    private String passwordMode;

    /** Chỉ dùng khi passwordMode là MANUAL. */
    @StrongPassword
    private String password;
}
