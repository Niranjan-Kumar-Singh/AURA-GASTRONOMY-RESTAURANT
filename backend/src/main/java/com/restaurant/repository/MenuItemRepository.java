package com.restaurant.repository;

import com.restaurant.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE m.category.id = :categoryId AND m.isAvailable = true")
    List<MenuItem> findByCategoryIdAndIsAvailableTrue(@Param("categoryId") Long categoryId);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE m.isAvailable = true")
    List<MenuItem> findAllActiveWithCategory();

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) AND m.isAvailable = true")
    List<MenuItem> searchMenuItems(@Param("query") String query);
}
