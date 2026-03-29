package com.clinicai.backend.service;

import com.clinicai.backend.dto.ReportDetailDTO;
import com.clinicai.backend.dto.ReportUploadResponse;
import com.clinicai.backend.model.MedicalReport;
import com.clinicai.backend.model.ReportInsight;
import com.clinicai.backend.model.User;
import com.clinicai.backend.repository.MedicalReportRepository;
import com.clinicai.backend.repository.ReportInsightRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
@Slf4j
public class ReportAnalysisService {

    private final R2StorageService r2StorageService;
    private final MedicalReportRepository reportRepository;
    private final ReportInsightRepository insightRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;
    private final String openRouterApiKey;
    private final String openRouterModel;
    private final WebClient openRouterClient;

    public ReportAnalysisService(
            R2StorageService r2StorageService,
            MedicalReportRepository reportRepository,
            ReportInsightRepository insightRepository,
            EmailService emailService,
            @Value("${openrouter.api-key}") String openRouterApiKey,
            @Value("${openrouter.model}") String openRouterModel,
            ObjectMapper objectMapper) {
        this.r2StorageService = r2StorageService;
        this.reportRepository = reportRepository;
        this.insightRepository = insightRepository;
        this.emailService = emailService;
        this.openRouterApiKey = openRouterApiKey;
        this.openRouterModel = openRouterModel;
        this.objectMapper = objectMapper;
        this.openRouterClient = WebClient.builder()
                .baseUrl("https://openrouter.ai/api/v1")
                .codecs(c -> c.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }

    /**
     * Upload report to storage and initiate background AI analysis.
     */
    public ReportUploadResponse uploadAndAnalyze(MultipartFile file, User user) {
        try {
            // 1. Upload to storage
            String storagePath = r2StorageService.upload(file, user.getId());

            // 2. Create report record in PENDING state
            MedicalReport report = MedicalReport.builder()
                    .user(user)
                    .fileName(file.getOriginalFilename())
                    .storagePath(storagePath)
                    .contentType(file.getContentType())
                    .status(MedicalReport.ReportStatus.PENDING)
                    .build();
            report = reportRepository.save(report);

            // 3. Process asynchronously using Spring @Async instead of Kafka
            ReportAnalysisService self = (ReportAnalysisService) org.springframework.aop.framework.AopContext.currentProxy();
            self.analyzeReportAsync(report.getId());

            return ReportUploadResponse.builder()
                    .reportId(report.getId())
                    .fileName(report.getFileName())
                    .status("PENDING")
                    .message("Report uploaded successfully. AI analysis has started in the background.")
                    .build();

        } catch (Exception e) {
            log.error("Report upload failed: {}", e.getMessage(), e);
            return ReportUploadResponse.builder()
                    .status("FAILED")
                    .message("Upload failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Perform the actual AI analysis asynchronously.
     */
    @org.springframework.scheduling.annotation.Async
    @org.springframework.transaction.annotation.Transactional
    public void analyzeReportAsync(Long reportId) {
        MedicalReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        try {
            log.info("Starting async AI analysis for report: {}", reportId);
            report.setStatus(MedicalReport.ReportStatus.PROCESSING);
            reportRepository.save(report);

            // 1. Download bytes and encode as Base64
            byte[] fileBytes = r2StorageService.download(report.getStoragePath());
            String base64Data = Base64.getEncoder().encodeToString(fileBytes);

            // 2. Call OpenRouter Vision API
            String aiResponse = callOpenRouterVision(base64Data, report.getContentType());

            // 3. Parse AI response and save insight
            ReportInsight insight = parseAndSaveInsight(aiResponse, report);

            // 4. Mark report as complete
            report.setStatus(MedicalReport.ReportStatus.COMPLETED);
            reportRepository.save(report);

            // 5. Send Email Notification
            emailService.sendReportSummary(report.getUser(), report, insight);
            report.setEmailSent(true);
            reportRepository.save(report);
            
            log.info("Async AI analysis completed for report: {}", reportId);

        } catch (Exception e) {
            log.error("Async report analysis failed for ID {}: {}", reportId, e.getMessage(), e);
            report.setStatus(MedicalReport.ReportStatus.FAILED);
            reportRepository.save(report);
        }
    }

    /**
     * Get all reports for a user.
     */
    public List<ReportDetailDTO> getUserReports(Long userId) {
        return reportRepository.findByUserIdOrderByUploadedAtDesc(userId).stream()
                .map(this::toDetailDTO)
                .toList();
    }

    /**
     * Get a single report detail (owner-only).
     */
    public ReportDetailDTO getReportDetail(Long reportId, Long userId) {
        MedicalReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return toDetailDTO(report);
    }

    private String callOpenRouterVision(String base64Data, String mimeType) throws Exception {
        String prompt = """
            You are a medical report analysis AI. Analyze the following medical report image/document.
            
            Provide your analysis in this EXACT JSON format only (no markdown, no code blocks):
            {
              "summary": "A clear 2-4 sentence summary of the report findings in plain language.",
              "findings": ["Finding 1", "Finding 2", "Finding 3"],
              "recommendations": ["Recommendation 1", "Recommendation 2"],
              "urgency": "LOW|MEDIUM|HIGH|CRITICAL",
              "confidence_score": 0.85
            }
            
            Rules:
            - "summary" should be patient-friendly, explaining what the report shows.
            - "findings" should list key observations, abnormal values, or important data points.
            - "recommendations" should suggest next steps (e.g., "Consult a cardiologist", "Repeat test in 3 months").
            - "urgency" must be one of: LOW, MEDIUM, HIGH, CRITICAL.
            - "confidence_score" is your confidence in the analysis (0.0 to 1.0).
            - If you cannot read the report, set urgency to MEDIUM and explain in summary.
            - Do NOT include any text outside the JSON.
            """;

        String dataUrl = "data:" + mimeType + ";base64," + base64Data;

        Map<String, Object> requestBody = Map.of(
                "model", openRouterModel,
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", List.of(
                                Map.of("type", "text", "text", prompt),
                                Map.of("type", "image_url", "image_url", Map.of("url", dataUrl))
                        )
                )),
                "temperature", 0.1
        );

        String response = openRouterClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + openRouterApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(objectMapper.writeValueAsString(requestBody))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Extract text from OpenAI/OpenRouter response format
        JsonNode root = objectMapper.readTree(response);
        return root.path("choices").get(0)
                .path("message").path("content").asText();
    }

    private ReportInsight parseAndSaveInsight(String aiResponse, MedicalReport report) throws Exception {
        // Clean response
        String cleaned = aiResponse.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode json = objectMapper.readTree(cleaned);

        String summary = json.path("summary").asText("Unable to analyze the report.");
        String urgencyStr = json.path("urgency").asText("MEDIUM").toUpperCase();
        double confidence = json.path("confidence_score").asDouble(0.5);

        // Parse arrays
        List<String> findings = new ArrayList<>();
        if (json.has("findings") && json.get("findings").isArray()) {
            for (JsonNode f : json.get("findings")) {
                findings.add(f.asText());
            }
        }

        List<String> recommendations = new ArrayList<>();
        if (json.has("recommendations") && json.get("recommendations").isArray()) {
            for (JsonNode r : json.get("recommendations")) {
                recommendations.add(r.asText());
            }
        }

        ReportInsight.Urgency urgency;
        try {
            urgency = ReportInsight.Urgency.valueOf(urgencyStr);
        } catch (IllegalArgumentException e) {
            urgency = ReportInsight.Urgency.MEDIUM;
        }

        ReportInsight insight = ReportInsight.builder()
                .report(report)
                .summary(summary)
                .findings(objectMapper.writeValueAsString(findings))
                .recommendations(objectMapper.writeValueAsString(recommendations))
                .urgency(urgency)
                .confidenceScore(confidence)
                .rawAiOutput(aiResponse)
                .build();

        return insightRepository.save(insight);
    }

    private ReportDetailDTO toDetailDTO(MedicalReport report) {
        ReportDetailDTO.ReportDetailDTOBuilder builder = ReportDetailDTO.builder()
                .id(report.getId())
                .fileName(report.getFileName())
                .contentType(report.getContentType())
                .status(report.getStatus() != null ? report.getStatus().name() : "PENDING")
                .emailSent(report.getEmailSent())
                .uploadedAt(report.getUploadedAt() != null ? report.getUploadedAt().toString() : null);

        // Generate temporary signed URL for the original report
        try {
            String signedUrl = r2StorageService.getSignedUrl(report.getStoragePath());
            builder.fileUrl(signedUrl);
        } catch (Exception e) {
            log.warn("Failed to generate signed URL for report {}: {}", report.getId(), e.getMessage());
        }

        // Load insight if available
        insightRepository.findByReportId(report.getId()).ifPresent(insight -> {
            builder.summary(insight.getSummary())
                    .urgency(insight.getUrgency().name())
                    .confidenceScore(insight.getConfidenceScore())
                    .processedAt(insight.getProcessedAt() != null ? insight.getProcessedAt().toString() : null);

            try {
                builder.findings(objectMapper.readValue(
                        insight.getFindings(), new TypeReference<List<String>>() {}));
                builder.recommendations(objectMapper.readValue(
                        insight.getRecommendations(), new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                log.warn("Failed to parse insight JSON for report {}", report.getId(), e);
                builder.findings(List.of())
                        .recommendations(List.of());
            }
        });

        return builder.build();
    }
}
