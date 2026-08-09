package com.restaurant.dto.response;

public record CategoryResponse(
    Long id,
    String name,
    String description,
    int displayOrder,
    String imageUrl,
    boolean isActive
) {}
