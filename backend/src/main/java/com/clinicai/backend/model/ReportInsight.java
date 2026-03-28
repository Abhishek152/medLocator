package com.clinicai.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_insights")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private MedicalReport report;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String findings; // JSON array string

    @Column(columnDefinition = "TEXT")
    private String recommendations; // JSON array string

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Urgency urgency = Urgency.LOW;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "raw_ai_output", columnDefinition = "TEXT")
    private String rawAiOutput;

    @CreationTimestamp
    @Column(name = "processed_at", nullable = false, updatable = false)
    private LocalDateTime processedAt;

    public enum Urgency {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
