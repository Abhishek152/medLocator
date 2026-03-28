package com.clinicai.backend.kafka;

import com.clinicai.backend.event.AppointmentBookedEvent;
import com.clinicai.backend.event.ReportAnalysisEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String APPOINTMENT_TOPIC = "appointment-events";
    private static final String REPORT_ANALYSIS_TOPIC = "report-analysis";

    public void publishAppointmentBooked(AppointmentBookedEvent event) {
        log.info("Publishing AppointmentBookedEvent to Kafka: {}", event);
        kafkaTemplate.send(APPOINTMENT_TOPIC, String.valueOf(event.getAppointmentId()), event);
    }

    public void publishReportAnalysis(ReportAnalysisEvent event) {
        log.info("Publishing ReportAnalysisEvent to Kafka: {}", event);
        kafkaTemplate.send(REPORT_ANALYSIS_TOPIC, String.valueOf(event.getReportId()), event);
    }
}
