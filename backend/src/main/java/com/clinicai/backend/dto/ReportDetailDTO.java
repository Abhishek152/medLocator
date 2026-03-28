package com.clinicai.backend.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDetailDTO {
    private Long id;
    private String fileName;
    private String contentType;
    private String status;
    private String uploadedAt;

    // Insight fields (null if not yet processed)
    private String summary;
    private List<String> findings;
    private List<String> recommendations;
    private String urgency;
    private Double confidenceScore;
    private String processedAt;

    private String fileUrl; // Signed URL for the original report
    private Boolean emailSent;
}
