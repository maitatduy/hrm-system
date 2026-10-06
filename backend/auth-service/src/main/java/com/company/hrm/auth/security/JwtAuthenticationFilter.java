package com.company.hrm.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Token lỗi (hết hạn, sai chữ ký, bị thu hồi) không chặn request ngay tại filter mà chỉ ghi lý do vào
 * request attribute. Endpoint public vẫn đi tiếp bình thường, endpoint cần xác thực sẽ được
 * {@link RestAuthenticationEntryPoint} trả về 401 kèm lý do này.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String AUTH_ERROR_ATTRIBUTE = "auth.tokenError";

    private static final String REDIS_BLACKLIST_PREFIX = "auth:blacklist:";

    private final StringRedisTemplate redisTemplate;
    private final JwtTokens jwtTokens;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token = resolveToken(request);

        if (StringUtils.hasText(token)) {
            try {
                // Chỉ nhận access token, refresh token gửi dưới dạng Bearer bị coi là không hợp lệ
                Claims claims = jwtTokens.parseAccess(token);

                if (isBlacklisted(claims.getId(), token)) {
                    log.warn("Token đã bị đưa vào blacklist: jti={}", claims.getId());
                    request.setAttribute(AUTH_ERROR_ATTRIBUTE, "Token đã bị thu hồi hoặc không còn hiệu lực");
                } else {
                    authenticate(request, claims);
                }
            } catch (ExpiredJwtException e) {
                request.setAttribute(AUTH_ERROR_ATTRIBUTE, "Access token đã hết hạn");
            } catch (JwtException e) {
                log.debug("JWT xác thực không hợp lệ: {}", e.getMessage());
                request.setAttribute(AUTH_ERROR_ATTRIBUTE, "Access token không hợp lệ");
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isBlacklisted(String jti, String token) {
        if (jti != null && Boolean.TRUE.equals(redisTemplate.hasKey(REDIS_BLACKLIST_PREFIX + jti))) {
            return true;
        }
        return Boolean.TRUE.equals(redisTemplate.hasKey(REDIS_BLACKLIST_PREFIX + token));
    }

    private void authenticate(HttpServletRequest request, Claims claims) {
        String userId = claims.getSubject();
        String role = claims.get("role", String.class);

        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            List<SimpleGrantedAuthority> authorities = role != null
                    ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    : Collections.emptyList();

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    authorities
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
