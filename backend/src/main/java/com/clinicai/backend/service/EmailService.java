package com.clinicai.backend.service;

import com.clinicai.backend.model.MedicalReport;
import com.clinicai.backend.model.ReportInsight;
import com.clinicai.backend.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final WebClient resendClient;
    private final String resendApiKey;
    private final String mailFrom;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${resend.api-key:}") String resendApiKey,
            @Value("${app.mail.from:}") String mailFrom,
            @Value("${spring.mail.username:}") String mailUsername) {
        this.mailSender = mailSender;
        this.resendApiKey = resendApiKey != null ? resendApiKey.trim() : "";
        this.mailFrom = firstNonBlank(mailFrom, mailUsername, "MedLocator <beth.t@example.com>");
        this.resendClient = WebClient.builder()
                .baseUrl("https://api.resend.com")
                .build();
    }

    /**
     * @return true if the message was accepted by the mail provider
     */
    public boolean sendEmail(String to, String subject, String body) {
        if (!StringUtils.hasText(to)) {
            log.warn("Skipping email: recipient is empty");
            return false;
        }

        if (StringUtils.hasText(resendApiKey)) {
            return sendViaResend(to, subject, body);
        }
        return sendViaSmtp(to, subject, body);
    }

    public boolean sendReportSummary(User user, MedicalReport report, ReportInsight insight) {
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

        return sendEmail(user.getEmail(), subject, body);
    }

    private boolean sendViaResend(String to, String subject, String body) {
        try {
            resendClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of(
                            "from", formatFrom(mailFrom),
                            "to", List.of(to),
                            "subject", subject,
                            "text", body
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(15));
            log.info("Email sent via Resend to {}", to);
            return true;
        } catch (WebClientResponseException e) {
            log.error("Resend rejected email to {}. Status: {} Body: {}",
                    to, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("Failed to send email via Resend to {}. Error: {}", to, e.getMessage());
            return false;
        }
    }

    private boolean sendViaSmtp(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent via SMTP to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send SMTP email to {}. Error: {}. "
                    + "Hosts like Railway/Render/Fly block smtp.gmail.com:587. "
                    + "Set RESEND_API_KEY to send mail over HTTPS instead.", to, e.getMessage());
            return false;
        }
    }

    private static String formatFrom(String from) {
        if (from.contains("<") && from.contains(">")) {
            return from;
        }
        return "MedLocator <" + from + ">";
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return "";
    }
}
