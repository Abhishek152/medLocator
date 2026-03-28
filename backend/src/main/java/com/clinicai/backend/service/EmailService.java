package com.clinicai.backend.service;

import com.clinicai.backend.model.MedicalReport;
import com.clinicai.backend.model.ReportInsight;
import com.clinicai.backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("MedLocator <no-reply@medlocator.com>");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}. Error: {}", to, e.getMessage());
        }
    }

    public void sendReportSummary(User user, MedicalReport report, ReportInsight insight) {
        String subject = "Your Medical Report Analysis is Ready - MedLocator";
        String body = String.format("""
                Hello %s,
                
                Your medical report "%s" has been analyzed by our AI.
                
                SUMMARY:
                %s
                
                URGENCY LEVEL: %s
                
                You can view the full details and recommendations by logging into your MedLocator dashboard.
                
                Stay healthy,
                The MedLocator Team
                """, 
                user.getName() != null ? user.getName() : "Patient",
                report.getFileName(),
                insight.getSummary(),
                insight.getUrgency());

        sendEmail(user.getEmail(), subject, body);
    }
}
