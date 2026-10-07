package com.company.hrm.auth.security;

import jakarta.servlet.http.HttpServletRequest;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
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

    /**
     * Đơn vị dùng cho rate limit theo IP. Một client IPv6 thường được cấp cả dải /64 nên tự đổi địa chỉ rất dễ;
     * gom về prefix /64 để đổi địa chỉ trong dải không vượt được giới hạn. IPv4 giữ nguyên.
     */
    public static String rateLimitSubject(String ip) {
        // Chỉ phân tích chuỗi có dấu ':' (IPv6 literal), InetAddress không tra DNS với literal nên không có request mạng
        if (ip == null || !ip.contains(":")) {
            return ip;
        }
        try {
            InetAddress address = InetAddress.getByName(ip);
            if (address instanceof Inet4Address) {
                // IPv6 ánh xạ IPv4 như ::ffff:203.0.113.7
                return address.getHostAddress();
            }
            byte[] bytes = address.getAddress();
            return String.format("%02x%02x:%02x%02x:%02x%02x:%02x%02x::/64",
                    bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]);
        } catch (UnknownHostException e) {
            return ip;
        }
    }
}
