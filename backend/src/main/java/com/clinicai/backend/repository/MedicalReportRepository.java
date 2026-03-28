package com.clinicai.backend.repository;

import com.clinicai.backend.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByUserIdOrderByUploadedAtDesc(Long userId);
}
