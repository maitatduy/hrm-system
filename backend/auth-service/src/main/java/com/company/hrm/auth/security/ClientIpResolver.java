package com.company.hrm.auth.security;

import jakarta.servlet.http.HttpServletRequest;

import java.util.regex.Pattern;

/**
 * Xác định IP của người dùng cho rate limit. auth-service đứng sau api-gateway nên địa chỉ kết nối là của gateway;
 * gateway gắn IP thật vào {@value #CLIENT_IP_HEADER} và luôn xóa header cùng tên do client tự gửi.
 * <p>
 * Chỉ tin header này khi cổng của auth-service không mở ra ngoài (mọi request đều qua gateway). Nếu sau này đặt
 * gateway sau load balancer, gateway phải lấy IP thật từ X-Forwarded-For của load balancer tin cậy.
 */
public final class ClientIpResolver {

    public static final String CLIENT_IP_HEADER = "X-Client-Ip";

    /** Chỉ chấp nhận chuỗi giống địa chỉ IPv4/IPv6 để giá trị lạ không trở thành key Redis tùy ý. */
    private static final Pattern IP_LITERAL = Pattern.compile("[0-9A-Fa-f:.]{2,45}");

    private ClientIpResolver() {
    }

    public static String resolve(HttpServletRequest request) {
        String forwarded = request.getHeader(CLIENT_IP_HEADER);
        if (forwarded != null && IP_LITERAL.matcher(forwarded.trim()).matches()) {
            return forwarded.trim();
        }
        return request.getRemoteAddr();
    }
}
