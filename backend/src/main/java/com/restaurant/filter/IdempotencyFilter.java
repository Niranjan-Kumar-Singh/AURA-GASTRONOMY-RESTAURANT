package com.restaurant.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class IdempotencyFilter extends OncePerRequestFilter {

    private static final String IDEMPOTENCY_HEADER = "X-Idempotency-Key";
    private final Map<String, String> processedKeys = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Enforce Idempotency on Cashier Settlement and Orders
        if (("POST".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) && 
            (path.contains("/cashier") || path.contains("/orders"))) {

            String idempotencyKey = request.getHeader(IDEMPOTENCY_HEADER);
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                if (processedKeys.containsKey(idempotencyKey)) {
                    response.setStatus(HttpServletResponse.SC_CONFLICT);
                    response.setContentType("application/json");
                    response.getWriter().write("""
                        {
                            "success": false,
                            "message": "IDEMPOTENCY REJECTION: Duplicate request detected for key '%s'. Operation previously processed.",
                            "data": null,
                            "timestamp": "%s"
                        }
                        """.formatted(idempotencyKey, java.time.Instant.now()));
                    return;
                }
                processedKeys.put(idempotencyKey, path);
            }
        }

        filterChain.doFilter(request, response);
    }
}
