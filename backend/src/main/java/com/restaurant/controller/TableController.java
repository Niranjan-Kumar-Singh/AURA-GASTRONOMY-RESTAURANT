package com.restaurant.controller;

import com.restaurant.dto.response.ApiResponse;
import com.restaurant.dto.response.TableResponse;
import com.restaurant.enums.TableStatus;
import com.restaurant.service.TableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tables")
@RequiredArgsConstructor
@Tag(name = "Restaurant Tables", description = "Table layout and occupancy management")
public class TableController {

    private final TableService tableService;

    @GetMapping
    @Operation(summary = "Get all restaurant tables and current occupancy status")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        List<TableResponse> tables = tableService.getAllTables();
        return ResponseEntity.ok(ApiResponse.success(tables));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single table details by ID")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(@PathVariable Long id) {
        TableResponse table = tableService.getTableById(id);
        return ResponseEntity.ok(ApiResponse.success(table));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update table status (VACANT, OCCUPIED, RESERVED, CLEANING)")
    public ResponseEntity<ApiResponse<TableResponse>> updateTableStatus(
        @PathVariable Long id,
        @RequestParam TableStatus status
    ) {
        TableResponse table = tableService.updateTableStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(table, "Table status updated to " + status));
    }
}
