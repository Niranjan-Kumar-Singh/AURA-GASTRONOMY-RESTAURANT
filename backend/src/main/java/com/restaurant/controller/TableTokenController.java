package com.restaurant.controller;

import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.TableTokenResponse;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.security.TableSessionTokenProvider;
import io.jsonwebtoken.Claims;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/table-tokens")
@RequiredArgsConstructor
@Tag(name = "Table QR Security Tokens", description = "Endpoints for generating and verifying cryptographic table QR tokens")
public class TableTokenController {

    private final TableSessionTokenProvider tableTokenProvider;
    private final RestaurantTableRepository tableRepository;

    @PostMapping("/generate/{tableId}")
    @Operation(summary = "Generate signed cryptographic QR token for a table")
    public ResponseEntity<ApiResponse<TableTokenResponse>> generateToken(
        @PathVariable Long tableId,
        @RequestParam(required = false, defaultValue = "DEFAULT_TENANT") String tenantId,
        @RequestParam(required = false, defaultValue = "MAIN_BRANCH") String branchId
    ) {
        RestaurantTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "id", tableId));

        String token = tableTokenProvider.generateTableToken(tenantId, branchId, table.getId(), table.getTableNumber());
        Claims claims = tableTokenProvider.getTableTokenClaims(token);

        TableTokenResponse response = new TableTokenResponse(
            token,
            claims.get("tenantId", String.class),
            claims.get("branchId", String.class),
            table.getId(),
            table.getTableNumber(),
            claims.get("sessionId", String.class),
            claims.getExpiration()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Table QR token generated successfully"));
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify cryptographic QR token signature and session validity")
    public ResponseEntity<ApiResponse<TableTokenResponse>> verifyToken(@RequestParam String token) {
        if (!tableTokenProvider.validateTableToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Cryptographic table QR token is invalid, tampered, or expired"));
        }

        Claims claims = tableTokenProvider.getTableTokenClaims(token);
        TableTokenResponse response = new TableTokenResponse(
            token,
            claims.get("tenantId", String.class),
            claims.get("branchId", String.class),
            claims.get("tableId", Long.class),
            claims.get("tableNumber", String.class),
            claims.get("sessionId", String.class),
            claims.getExpiration()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Table token signature verified"));
    }
}
