package com.restaurant.dto.request;

import com.restaurant.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
    @NotNull(message = "Order ID is required")
    Long orderId,

    @NotNull(message = "Payment Method is required")
    PaymentMethod paymentMethod
) {}
