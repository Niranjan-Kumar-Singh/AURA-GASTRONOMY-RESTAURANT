package com.restaurant.service;

import com.restaurant.entity.MenuItem;
import com.restaurant.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationEngineService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItem> getRecommendations(Long tableId, List<Long> cartItemIds) {
        List<MenuItem> allAvailable = menuItemRepository.findAllActiveWithCategory();
        if (allAvailable.isEmpty()) {
            return Collections.emptyList();
        }

        LocalTime now = LocalTime.now();
        
        // Exclude items already in cart
        List<MenuItem> filtered = allAvailable.stream()
            .filter(item -> cartItemIds == null || !cartItemIds.contains(item.getId()))
            .collect(Collectors.toList());

        if (filtered.isEmpty()) {
            return allAvailable.stream().limit(4).collect(Collectors.toList());
        }

        // Time of day heuristic filtering
        if (now.isBefore(LocalTime.of(11, 0))) {
            // Morning / Breakfast priority
            List<MenuItem> breakfastItems = filtered.stream()
                .filter(item -> item.getName().toLowerCase().contains("coffee") || 
                                item.getName().toLowerCase().contains("espresso") || 
                                item.getName().toLowerCase().contains("croissant") ||
                                item.getName().toLowerCase().contains("pancake") ||
                                item.getCategory().getName().equalsIgnoreCase("Beverages"))
                .collect(Collectors.toList());
            if (!breakfastItems.isEmpty()) return breakfastItems.stream().limit(6).collect(Collectors.toList());
        }

        // Default smart pairing limit to 6 premium suggestions
        Collections.shuffle(filtered);
        return filtered.stream().limit(6).collect(Collectors.toList());
    }
}
