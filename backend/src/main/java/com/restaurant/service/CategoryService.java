package com.restaurant.service;

import com.restaurant.dto.response.CategoryResponse;
import com.restaurant.entity.Category;
import com.restaurant.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc()
            .stream()
            .map(this::mapToCategoryResponse)
            .toList();
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getDescription(),
            category.getDisplayOrder(),
            category.getImageUrl(),
            category.isActive()
        );
    }
}
