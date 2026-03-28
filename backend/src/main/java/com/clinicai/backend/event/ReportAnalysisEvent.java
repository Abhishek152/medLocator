package com.clinicai.backend.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportAnalysisEvent {
    private Long reportId;
    private Long userId;
    private String storagePath;
    private String contentType;
}
