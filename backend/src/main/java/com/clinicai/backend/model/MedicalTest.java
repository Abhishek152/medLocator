package com.clinicai.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medical_tests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_name", nullable = false, unique = true, length = 200)
    private String testName;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "typical_min_price", nullable = false)
    private int typicalMinPrice;

    @Column(name = "typical_max_price", nullable = false)
    private int typicalMaxPrice;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String keywords;
}
