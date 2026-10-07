package com.company.hrm.auth.service.event;

/**
 * Phát ra khi tạo tài khoản với mật khẩu do hệ thống sinh, để gửi mật khẩu tạm cho người dùng sau khi
 * transaction commit. Event chỉ sống trong bộ nhớ, không đi qua Kafka vì chứa mật khẩu dạng rõ.
 */
public record AccountCreatedEvent(String email, String temporaryPassword) {

    /** Không để mật khẩu lọt vào log nếu event bị in ra. */
    @Override
    public String toString() {
        return "AccountCreatedEvent[email=" + email + ", temporaryPassword=***]";
    }
}
