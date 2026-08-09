package com.restaurant.service;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.dto.response.PaymentResponse;
import com.restaurant.entity.Order;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentStatus;
import com.restaurant.enums.TableStatus;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final OrderService orderService;

    @Transactional
    public PaymentResponse settlePayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.orderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.orderId()));

        order.setPaymentMethod(request.paymentMethod());
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.COMPLETED);

        // Free up the table
        order.getTable().setTableStatus(TableStatus.VACANT);
        tableRepository.save(order.getTable());

        Order saved = orderRepository.save(order);

        return new PaymentResponse(
            saved.getId(),
            saved.getOrderNumber(),
            saved.getTable().getTableNumber(),
            saved.getTotalAmount(),
            saved.getPaymentMethod(),
            saved.getPaymentStatus(),
            Instant.now()
        );
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getPendingBills() {
        return orderRepository.findAll().stream()
            .filter(o -> o.getPaymentStatus() == PaymentStatus.PENDING && o.getOrderStatus() != OrderStatus.CANCELLED)
            .map(orderService::mapToOrderResponse)
            .toList();
    }
}
