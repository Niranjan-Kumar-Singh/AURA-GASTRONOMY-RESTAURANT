package com.restaurant.controller;

import com.restaurant.dto.request.PaymentRequest;
import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.OrderResponse;
import com.restaurant.dto.response.PaymentResponse;
import com.restaurant.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cashier")
@RequiredArgsConstructor
@Tag(name = "Cashier & Billing POS", description = "Endpoints for bill settlement and payments")
public class CashierController {

    private final PaymentService paymentService;

    @GetMapping("/pending-bills")
    @Operation(summary = "Get list of open table orders awaiting payment settlement")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getPendingBills() {
        List<OrderResponse> bills = paymentService.getPendingBills();
        return ResponseEntity.ok(ApiResponse.success(bills));
    }

    @PostMapping("/settle")
    @Operation(summary = "Process payment and close bill for an order")
    public ResponseEntity<ApiResponse<PaymentResponse>> settlePayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.settlePayment(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment settled successfully"));
    }
}
