package com.restaurant.dto.response;

import com.restaurant.enums.TableStatus;

public record TableResponse(
    Long id,
    String tableNumber,
    int capacity,
    String qrCodeToken,
    TableStatus tableStatus
) {}
