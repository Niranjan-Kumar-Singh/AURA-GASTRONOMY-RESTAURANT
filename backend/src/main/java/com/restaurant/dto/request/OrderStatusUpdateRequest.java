package com.restaurant.dto.request;

import com.restaurant.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
    @NotNull(message = "Status is required")
    OrderStatus status
) {}
