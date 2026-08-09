package com.restaurant.repository;

import com.restaurant.entity.Order;
import com.restaurant.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.table JOIN FETCH o.items WHERE o.orderStatus IN :statuses ORDER BY o.createdAt ASC")
    List<Order> findActiveKitchenOrders(@Param("statuses") List<OrderStatus> statuses);

    @Query("SELECT o FROM Order o JOIN FETCH o.table JOIN FETCH o.items WHERE o.table.id = :tableId AND o.orderStatus NOT IN ('COMPLETED', 'CANCELLED') ORDER BY o.createdAt DESC")
    List<Order> findActiveOrdersByTableId(@Param("tableId") Long tableId);
}
