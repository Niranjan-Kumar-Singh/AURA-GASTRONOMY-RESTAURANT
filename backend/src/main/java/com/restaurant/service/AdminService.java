package com.restaurant.service;

import com.restaurant.dto.response.DashboardAnalyticsResponse;
import com.restaurant.entity.Order;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentStatus;
import com.restaurant.enums.TableStatus;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;

    @Transactional(readOnly = true)
    public DashboardAnalyticsResponse getAnalyticsSummary() {
        List<Order> allOrders = orderRepository.findAll();
        List<RestaurantTable> allTables = tableRepository.findAll();

        BigDecimal totalRevenue = allOrders.stream()
            .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrdersToday = allOrders.size();
        long activeTablesCount = allTables.stream().filter(t -> t.getTableStatus() == TableStatus.OCCUPIED).count();
        long vacantTablesCount = allTables.stream().filter(t -> t.getTableStatus() == TableStatus.VACANT).count();
        long pendingKitchenCount = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.PLACED || o.getOrderStatus() == OrderStatus.PREPARING).count();

        return new DashboardAnalyticsResponse(
            totalRevenue,
            totalOrdersToday,
            activeTablesCount,
            vacantTablesCount,
            pendingKitchenCount
        );
    }
}
