package com.clinicai.backend.repository;

import com.clinicai.backend.model.ReportInsight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportInsightRepository extends JpaRepository<ReportInsight, Long> {
    Optional<ReportInsight> findByReportId(Long reportId);
}
