package com.restaurant.service;

import com.restaurant.entity.Reservation;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.exception.BadRequestException;
import com.restaurant.repository.ReservationRepository;
import com.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;

    @Transactional
    public Reservation createReservation(Reservation reservation) {
        if (reservation.getPartySize() == null || reservation.getPartySize() <= 0) {
            throw new BadRequestException("Party size must be greater than 0");
        }

        if (reservation.getReservationTime() == null || reservation.getReservationTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reservation time must be in the future");
        }

        // Table capacity validation & Conflict checking
        if (reservation.getTable() != null && reservation.getTable().getId() != null) {
            RestaurantTable table = tableRepository.findById(reservation.getTable().getId())
                .orElseThrow(() -> new BadRequestException("Specified table does not exist"));

            if (table.getCapacity() < reservation.getPartySize()) {
                throw new BadRequestException("Selected table capacity (%d) is smaller than party size (%d)".formatted(table.getCapacity(), reservation.getPartySize()));
            }

            // Check double-booking conflict within 2-hour window
            LocalDateTime windowStart = reservation.getReservationTime().minusHours(2);
            LocalDateTime windowEnd = reservation.getReservationTime().plusHours(2);
            List<Reservation> conflicts = reservationRepository.findByReservationTimeBetweenOrderByReservationTimeAsc(windowStart, windowEnd)
                .stream()
                .filter(r -> r.getTable() != null && r.getTable().getId().equals(table.getId()) && !"CANCELLED".equals(r.getStatus()))
                .toList();

            if (!conflicts.isEmpty()) {
                throw new BadRequestException("DOUBLE-BOOKING CONFLICT: Table %s is already reserved during that time window".formatted(table.getTableNumber()));
            }
        }

        return reservationRepository.save(reservation);
    }
}
