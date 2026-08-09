package com.restaurant.dto.response;

import java.util.Date;

public record TableTokenResponse(
    String token,
    String tenantId,
    String branchId,
    Long tableId,
    String tableNumber,
    String sessionId,
    Date expiresAt
) {}
