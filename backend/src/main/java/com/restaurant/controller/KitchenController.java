package com.restaurant.controller;

import com.restaurant.dto.request.OrderStatusUpdateRequest;
import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/kitchen")
@RequiredArgsConstructor
@Tag(name = "Kitchen Display System (KDS)", description = "Chef operations and live ticket queue")
public class KitchenController {

    private final OrderService orderService;

    @GetMapping("/orders")
    @Operation(summary = "Get active kitchen ticket queue (Placed, Confirmed, Preparing)")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveKitchenOrders() {
        List<OrderResponse> orders = orderService.getActiveKitchenOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Advance kitchen ticket status (e.g. PREPARING -> READY)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateKitchenOrderStatus(
        @PathVariable Long id,
        @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderResponse response = orderService.updateOrderStatus(id, request.status());
        return ResponseEntity.ok(ApiResponse.success(response, "Kitchen ticket status updated"));
    }
}
