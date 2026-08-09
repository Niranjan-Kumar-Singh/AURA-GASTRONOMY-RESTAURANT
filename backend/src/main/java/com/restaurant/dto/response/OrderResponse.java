package com.restaurant.dto.response;

import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentMethod;
import com.restaurant.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    Long id,
    String orderNumber,
    Long tableId,
    String tableNumber,
    String waiterName,
    OrderStatus orderStatus,
    PaymentStatus paymentStatus,
    PaymentMethod paymentMethod,
    BigDecimal subtotal,
    BigDecimal taxAmount,
    BigDecimal serviceCharge,
    BigDecimal discountAmount,
    BigDecimal totalAmount,
    String specialInstructions,
    List<OrderItemResponse> items,
    Instant createdAt
) {}
