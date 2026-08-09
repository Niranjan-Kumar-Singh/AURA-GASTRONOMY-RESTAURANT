package com.restaurant.entity;

import com.restaurant.enums.TableStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Table(name = "restaurant_tables")
@SQLDelete(sql = "UPDATE restaurant_tables SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable extends BaseEntity {

    @Column(name = "table_number", nullable = false, unique = true, length = 20)
    private String tableNumber;

    @Builder.Default
    @Column(name = "capacity", nullable = false)
    private int capacity = 4;

    @Column(name = "qr_code_token", nullable = false, unique = true, length = 100)
    private String qrCodeToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "table_status", nullable = false, length = 30)
    @Builder.Default
    private TableStatus tableStatus = TableStatus.VACANT;
}
