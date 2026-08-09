package com.restaurant.service;

import com.restaurant.dto.response.MenuItemResponse;
import com.restaurant.entity.MenuItem;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAllActiveMenuItems(Long categoryId, String search) {
        List<MenuItem> items;
        if (search != null && !search.isBlank()) {
            items = menuItemRepository.searchMenuItems(search.trim());
        } else if (categoryId != null) {
            items = menuItemRepository.findByCategoryIdAndIsAvailableTrue(categoryId);
        } else {
            items = menuItemRepository.findAllActiveWithCategory();
        }

        return items.stream()
            .map(this::mapToMenuItemResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
        return mapToMenuItemResponse(item);
    }

    private MenuItemResponse mapToMenuItemResponse(MenuItem item) {
        return new MenuItemResponse(
            item.getId(),
            item.getCategory().getId(),
            item.getCategory().getName(),
            item.getName(),
            item.getDescription(),
            item.getPrice(),
            item.getImageUrl(),
            item.isAvailable(),
            item.isVegetarian(),
            item.isGlutenFree(),
            item.getPreparationTimeMinutes()
        );
    }
}
