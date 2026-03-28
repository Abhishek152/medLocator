package com.clinicai.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiTestRecommendationResponse {
    private String aiExplanation;
    private List<MedicalTestDTO> suggestedTests;
}
