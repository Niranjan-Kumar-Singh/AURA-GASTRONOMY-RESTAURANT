package com.restaurant.controller;

import com.restaurant.dto.response.ApiResponse;
import com.restaurant.entity.MenuItem;
import com.restaurant.service.RecommendationEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendation Engine", description = "Endpoints for context-aware menu recommendations")
public class RecommendationController {

    private final RecommendationEngineService recommendationEngineService;

    @GetMapping
    @Operation(summary = "Get context-aware menu recommendations for customer table")
    public ResponseEntity<ApiResponse<List<MenuItem>>> getRecommendations(
        @RequestParam(required = false) Long tableId,
        @RequestParam(required = false) List<Long> cartItemIds
    ) {
        List<MenuItem> recommendations = recommendationEngineService.getRecommendations(tableId, cartItemIds);
        return ResponseEntity.ok(ApiResponse.success(recommendations, "Contextual recommendations retrieved successfully"));
    }
}
