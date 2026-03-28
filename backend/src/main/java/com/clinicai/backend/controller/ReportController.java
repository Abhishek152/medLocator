package com.clinicai.backend.controller;

import com.clinicai.backend.dto.ReportDetailDTO;
import com.clinicai.backend.dto.ReportUploadResponse;
import com.clinicai.backend.model.User;
import com.clinicai.backend.service.ReportAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportAnalysisService reportAnalysisService;

    /**
     * Upload a medical report (PDF/image) for AI analysis.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReportUploadResponse> uploadReport(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {

        ReportUploadResponse response = reportAnalysisService.uploadAndAnalyze(file, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all reports for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<ReportDetailDTO>> getMyReports(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        List<ReportDetailDTO> reports = reportAnalysisService.getUserReports(user.getId());
        return ResponseEntity.ok(reports);
    }

    /**
     * Get a specific report detail (owner-only).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportDetailDTO> getReportDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        ReportDetailDTO detail = reportAnalysisService.getReportDetail(id, user.getId());
        return ResponseEntity.ok(detail);
    }
}
