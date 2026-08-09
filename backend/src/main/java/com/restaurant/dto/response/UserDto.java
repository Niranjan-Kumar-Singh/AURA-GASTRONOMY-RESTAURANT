package com.restaurant.dto.response;

import com.restaurant.enums.Role;

public record UserDto(
    Long id,
    String email,
    String fullName,
    String phoneNumber,
    Role role,
    boolean isActive
) {}
