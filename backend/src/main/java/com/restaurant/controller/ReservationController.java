package com.restaurant.controller;

import com.restaurant.dto.response.ApiResponse;
import com.restaurant.entity.Reservation;
import com.restaurant.repository.ReservationRepository;
import com.restaurant.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservation Engine", description = "Endpoints for guest table reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;

    @GetMapping
    @Operation(summary = "Get all active reservations")
    public ResponseEntity<ApiResponse<List<Reservation>>> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(reservations, "Reservations retrieved successfully"));
    }

    @PostMapping
    @Operation(summary = "Book a table reservation with conflict validation")
    public ResponseEntity<ApiResponse<Reservation>> createReservation(@RequestBody Reservation reservation) {
        Reservation saved = reservationService.createReservation(reservation);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved, "Reservation confirmed successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update reservation status (CONFIRMED, SEATED, CANCELLED)")
    public ResponseEntity<ApiResponse<Reservation>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found with id " + id));
        reservation.setStatus(status);
        Reservation updated = reservationRepository.save(reservation);
        return ResponseEntity.ok(ApiResponse.success(updated, "Reservation status updated to " + status));
    }
}
