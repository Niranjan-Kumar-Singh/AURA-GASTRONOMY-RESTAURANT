package com.restaurant.dto.response;

import com.restaurant.enums.PaymentMethod;
import com.restaurant.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
    Long orderId,
    String orderNumber,
    String tableNumber,
    BigDecimal amountPaid,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    Instant settledAt
) {}
