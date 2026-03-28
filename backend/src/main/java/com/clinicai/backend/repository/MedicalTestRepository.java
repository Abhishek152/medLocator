package com.clinicai.backend.repository;

import com.clinicai.backend.model.MedicalTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalTestRepository extends JpaRepository<MedicalTest, Long> {

    List<MedicalTest> findByCategoryIgnoreCase(String category);

    @Query("SELECT t FROM MedicalTest t WHERE " +
           "LOWER(t.testName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.keywords) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<MedicalTest> searchTests(@Param("query") String query);

    @Query("SELECT t FROM MedicalTest t WHERE LOWER(t.testName) IN :names")
    List<MedicalTest> findByTestNameInIgnoreCase(@Param("names") List<String> names);
}
