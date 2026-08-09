package com.restaurant.controller;

import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.DashboardAnalyticsResponse;
import com.restaurant.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Analytics", description = "Executive dashboard metrics and business analytics")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/analytics")
    @Operation(summary = "Get daily revenue, order velocity, and table occupancy summary")
    public ResponseEntity<ApiResponse<DashboardAnalyticsResponse>> getAnalyticsSummary() {
        DashboardAnalyticsResponse analytics = adminService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
