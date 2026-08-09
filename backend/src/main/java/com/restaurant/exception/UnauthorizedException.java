package com.restaurant.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends BaseDomainException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }
}
