package com.restaurant.service;

import com.restaurant.dto.request.CreateOrderRequest;
import com.restaurant.dto.request.OrderItemRequest;
import com.restaurant.dto.response.OrderItemResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.entity.MenuItem;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.ItemStatus;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.TableStatus;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.MenuItemRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        RestaurantTable table = tableRepository.findById(request.tableId())
            .orElseThrow(() -> new ResourceNotFoundException("Table", "id", request.tableId()));

        String orderNumber = generateOrderNumber();
        Order order = Order.builder()
            .orderNumber(orderNumber)
            .table(table)
            .orderStatus(OrderStatus.PLACED)
            .specialInstructions(request.specialInstructions())
            .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.menuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", itemReq.menuItemId()));

            if (!menuItem.isAvailable()) {
                throw new BadRequestException("Item '" + menuItem.getName() + "' is currently sold out.", "ITEM_OUT_OF_STOCK");
            }

            BigDecimal lineTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                .menuItem(menuItem)
                .itemName(menuItem.getName())
                .unitPrice(menuItem.getPrice())
                .quantity(itemReq.quantity())
                .totalPrice(lineTotal)
                .itemStatus(ItemStatus.PENDING)
                .specialNotes(itemReq.specialNotes())
                .build();

            order.addOrderItem(orderItem);
        }

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.10")); // 10% tax
        BigDecimal serviceCharge = subtotal.multiply(new BigDecimal("0.05")); // 5% service charge
        BigDecimal grandTotal = subtotal.add(tax).add(serviceCharge);

        order.setSubtotal(subtotal);
        order.setTaxAmount(tax);
        order.setServiceCharge(serviceCharge);
        order.setTotalAmount(grandTotal);

        table.setTableStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);

        Order savedOrder = orderRepository.save(order);
        OrderResponse response = mapToOrderResponse(savedOrder);

        // Notify Kitchen KDS & Guest channel via STOMP WebSocket
        try {
            messagingTemplate.convertAndSend("/topic/kitchen", response);
            messagingTemplate.convertAndSend("/topic/table/" + table.getId(), response);
        } catch (Exception e) {
            log.warn("Could not dispatch WebSocket notification: {}", e.getMessage());
        }

        return response;
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveKitchenOrders() {
        List<OrderStatus> activeStatuses = List.of(OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING);
        return orderRepository.findActiveKitchenOrders(activeStatuses).stream()
            .map(this::mapToOrderResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveOrdersByTable(Long tableId) {
        return orderRepository.findActiveOrdersByTableId(tableId).stream()
            .map(this::mapToOrderResponse)
            .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setOrderStatus(status);
        if (status == OrderStatus.COMPLETED || status == OrderStatus.CANCELLED) {
            order.getTable().setTableStatus(TableStatus.VACANT);
            tableRepository.save(order.getTable());
        }

        Order updated = orderRepository.save(order);
        OrderResponse response = mapToOrderResponse(updated);

        // Notify STOMP channels
        try {
            messagingTemplate.convertAndSend("/topic/kitchen", response);
            messagingTemplate.convertAndSend("/topic/table/" + order.getTable().getId(), response);
        } catch (Exception e) {
            log.warn("Could not dispatch WebSocket notification: {}", e.getMessage());
        }

        return response;
    }

    private String generateOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "AURA-" + date + "-" + suffix;
    }

    public OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
            .map(item -> new OrderItemResponse(
                item.getId(),
                item.getMenuItem().getId(),
                item.getItemName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getTotalPrice(),
                item.getItemStatus(),
                item.getSpecialNotes()
            ))
            .toList();

        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getTable().getId(),
            order.getTable().getTableNumber(),
            order.getWaiter() != null ? order.getWaiter().getFullName() : null,
            order.getOrderStatus(),
            order.getPaymentStatus(),
            order.getPaymentMethod(),
            order.getSubtotal(),
            order.getTaxAmount(),
            order.getServiceCharge(),
            order.getDiscountAmount(),
            order.getTotalAmount(),
            order.getSpecialInstructions(),
            itemResponses,
            order.getCreatedAt()
        );
    }
}
