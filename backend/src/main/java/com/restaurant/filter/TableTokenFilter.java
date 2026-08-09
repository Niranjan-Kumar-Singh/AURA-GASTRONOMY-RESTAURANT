package com.restaurant.filter;

import com.restaurant.security.TableSessionTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class TableTokenFilter extends OncePerRequestFilter {

    private static final String TABLE_TOKEN_HEADER = "X-Table-Token";
    private final TableSessionTokenProvider tableTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Enforce cryptographic table token validation on customer order placement
        if ("/api/v1/orders".equals(path) && "POST".equalsIgnoreCase(method)) {
            String token = request.getHeader(TABLE_TOKEN_HEADER);
            if (token == null || token.isBlank() || !tableTokenProvider.validateTableToken(token)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("""
                    {
                        "success": false,
                        "message": "SECURITY REJECTION: Valid cryptographic X-Table-Token header is required for customer table order placement.",
                        "data": null,
                        "timestamp": "%s"
                    }
                    """.formatted(java.time.Instant.now()));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
