package com.clinicai.backend.kafka;

import com.clinicai.backend.event.ReportAnalysisEvent;
import com.clinicai.backend.service.ReportAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final ReportAnalysisService reportAnalysisService;

    @KafkaListener(topics = "report-analysis", groupId = "medlocator-group")
    public void consumeReportAnalysis(ReportAnalysisEvent event) {
        log.info("Received Kafka Event: Report Analysis requested for report ID {}", event.getReportId());
        
        try {
            reportAnalysisService.analyzeReportAsync(event.getReportId());
        } catch (Exception e) {
            log.error("Failed to process async report analysis: {}", e.getMessage(), e);
        }
    }
}
