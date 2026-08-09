package com.restaurant.dto.response;

import com.restaurant.enums.ItemStatus;

import java.math.BigDecimal;

public record OrderItemResponse(
    Long id,
    Long menuItemId,
    String itemName,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal totalPrice,
    ItemStatus itemStatus,
    String specialNotes
) {}
