package com.clinicai.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportUploadResponse {
    private Long reportId;
    private String fileName;
    private String status;
    private String message;
}
