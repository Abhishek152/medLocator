package com.clinicai.backend.kafka;

import com.clinicai.backend.event.AppointmentBookedEvent;
import com.clinicai.backend.event.ReportAnalysisEvent;
import com.clinicai.backend.repository.UserRepository;
import com.clinicai.backend.service.EmailService;
import com.clinicai.backend.service.ReportAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ReportAnalysisService reportAnalysisService;

    @KafkaListener(topics = "appointment-events", groupId = "clinic-ai-group")
    public void consumeAppointmentBooked(AppointmentBookedEvent event) {
        log.info("Received Kafka Event: Appointment {} booked for patient {} at {}", 
                event.getAppointmentId(), event.getPatientName(), event.getClinicName());

        // Fetch User to get email
        userRepository.findById(event.getPatientId()).ifPresentOrElse(user -> {
            String email = user.getEmail();
            if (email != null && !email.isBlank()) {
                String subject = "Appointment Confirmation - MedLocator";
                String body = String.format("Hello %s,\n\nYour appointment with %s at %s is confirmed for %s.\n\nThank you for choosing MedLocator!",
                        event.getPatientName(), event.getDoctorName(), event.getClinicName(), event.getAppointmentTime());
                
                log.info("Sending Email to {}: {}", email, subject);
                emailService.sendEmail(email, subject, body);
            } else {
                log.warn("Cannot send Email. User (ID: {}) does not have an email address configured.", user.getId());
            }
        }, () -> log.error("User not found for ID: {}. Cannot send Email.", event.getPatientId()));
    }

    @KafkaListener(topics = "report-analysis", groupId = "clinic-ai-group")
    public void consumeReportAnalysis(ReportAnalysisEvent event) {
        log.info("Received Kafka Event: Report Analysis requested for report ID {}", event.getReportId());
        
        try {
            reportAnalysisService.analyzeReportAsync(event.getReportId());
        } catch (Exception e) {
            log.error("Failed to process async report analysis: {}", e.getMessage(), e);
        }
    }
}
