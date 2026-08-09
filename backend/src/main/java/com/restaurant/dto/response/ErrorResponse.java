package com.restaurant.dto.response;

import java.time.Instant;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String code,
    String message,
    String path,
    String traceId
) {
    public static ErrorResponse of(int status, String error, String code, String message, String path, String traceId) {
        return new ErrorResponse(Instant.now(), status, error, code, message, path, traceId);
    }
}
