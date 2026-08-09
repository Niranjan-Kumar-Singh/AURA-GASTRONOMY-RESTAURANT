package com.restaurant.dto.response;

import java.math.BigDecimal;

public record MenuItemResponse(
    Long id,
    Long categoryId,
    String categoryName,
    String name,
    String description,
    BigDecimal price,
    String imageUrl,
    boolean isAvailable,
    boolean isVegetarian,
    boolean isGlutenFree,
    int preparationTimeMinutes
) {}
