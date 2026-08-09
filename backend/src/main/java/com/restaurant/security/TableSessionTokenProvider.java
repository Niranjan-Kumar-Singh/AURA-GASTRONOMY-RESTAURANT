package com.restaurant.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
public class TableSessionTokenProvider {

    private final SecretKey key;
    private final long tableSessionExpirationMs;

    public TableSessionTokenProvider(
        @Value("${security.jwt.secret:401b61e0369fed0476d9f7c5d6f0c72719a86895311e63a15f013}") String jwtSecret,
        @Value("${security.table.expiration-ms:14400000}") long tableSessionExpirationMs // 4 hours
    ) {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.tableSessionExpirationMs = tableSessionExpirationMs;
    }

    public String generateTableToken(String tenantId, String branchId, Long tableId, String tableNumber) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + tableSessionExpirationMs);
        String sessionId = UUID.randomUUID().toString();
        String nonce = UUID.randomUUID().toString().substring(0, 8);

        return Jwts.builder()
            .subject(tableId.toString())
            .claim("tenantId", tenantId != null ? tenantId : "DEFAULT_TENANT")
            .claim("branchId", branchId != null ? branchId : "MAIN_BRANCH")
            .claim("tableId", tableId)
            .claim("tableNumber", tableNumber)
            .claim("sessionId", sessionId)
            .claim("nonce", nonce)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact();
    }

    public Claims getTableTokenClaims(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public boolean validateTableToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception ex) {
            log.error("Invalid or expired table QR token: {}", ex.getMessage());
            return false;
        }
    }
}
