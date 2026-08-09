package com.restaurant.service;

import com.restaurant.dto.response.TableResponse;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.TableStatus;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {

    private final RestaurantTableRepository tableRepository;

    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll().stream()
            .map(this::mapToTableResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Table", "id", id));
        return mapToTableResponse(table);
    }

    @Transactional
    public TableResponse updateTableStatus(Long id, TableStatus status) {
        RestaurantTable table = tableRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Table", "id", id));
        table.setTableStatus(status);
        RestaurantTable saved = tableRepository.save(table);
        return mapToTableResponse(saved);
    }

    public TableResponse mapToTableResponse(RestaurantTable table) {
        return new TableResponse(
            table.getId(),
            table.getTableNumber(),
            table.getCapacity(),
            table.getQrCodeToken(),
            table.getTableStatus()
        );
    }
}
