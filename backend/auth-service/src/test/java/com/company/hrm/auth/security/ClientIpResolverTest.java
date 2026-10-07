package com.company.hrm.auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class ClientIpResolverTest {

    private static MockHttpServletRequest requestFromGateway(String clientIpHeader) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.5");
        if (clientIpHeader != null) {
            request.addHeader(ClientIpResolver.CLIENT_IP_HEADER, clientIpHeader);
        }
        return request;
    }

    @Test
    void usesTheClientIpSetByTheGateway() {
        assertThat(ClientIpResolver.resolve(requestFromGateway("203.0.113.7"))).isEqualTo("203.0.113.7");
        assertThat(ClientIpResolver.resolve(requestFromGateway("2001:db8::1"))).isEqualTo("2001:db8::1");
    }

    @Test
    void fallsBackToTheConnectionAddressWithoutHeader() {
        assertThat(ClientIpResolver.resolve(requestFromGateway(null))).isEqualTo("10.0.0.5");
    }

    @Test
    void groupsIpv6AddressesByTheirSlash64Prefix() {
        // Hai địa chỉ trong cùng dải /64 của một client được tính chung một bộ đếm
        assertThat(ClientIpResolver.rateLimitSubject("2001:db8:abcd:12::1"))
                .isEqualTo(ClientIpResolver.rateLimitSubject("2001:db8:abcd:12:ffff:ffff:ffff:fffe"))
                .isEqualTo("2001:0db8:abcd:0012::/64");
        assertThat(ClientIpResolver.rateLimitSubject("2001:db8:abcd:13::1")).isEqualTo("2001:0db8:abcd:0013::/64");
    }

    @Test
    void keepsIpv4AndUnwrapsIpv4MappedAddresses() {
        assertThat(ClientIpResolver.rateLimitSubject("203.0.113.7")).isEqualTo("203.0.113.7");
        assertThat(ClientIpResolver.rateLimitSubject("::ffff:203.0.113.7")).isEqualTo("203.0.113.7");
    }

    @Test
    void ignoresValuesThatAreNotIpAddresses() {
        // Không để giá trị tùy ý thành một phần của key Redis
        assertThat(ClientIpResolver.resolve(requestFromGateway("evil key*"))).isEqualTo("10.0.0.5");
        assertThat(ClientIpResolver.resolve(requestFromGateway("1.2.3.4, 5.6.7.8"))).isEqualTo("10.0.0.5");
    }
}
