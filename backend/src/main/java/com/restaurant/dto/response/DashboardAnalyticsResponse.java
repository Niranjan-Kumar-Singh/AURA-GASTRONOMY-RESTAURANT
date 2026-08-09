package com.restaurant.dto.response;

import java.math.BigDecimal;

public record DashboardAnalyticsResponse(
    BigDecimal totalRevenueToday,
    long totalOrdersToday,
    long activeTablesCount,
    long vacantTablesCount,
    long pendingKitchenTicketsCount
) {}
