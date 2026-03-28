package com.clinicai.backend.controller;

import com.clinicai.backend.dto.AiTestRecommendationResponse;
import com.clinicai.backend.dto.NearbyPlaceDTO;
import com.clinicai.backend.dto.SymptomRequest;
import com.clinicai.backend.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI-powered symptom analysis, test recommendations, and clinic search")
public class AiController {

    private final AiService aiService;

    @PostMapping("/recommend-tests")
    @Operation(summary = "Get AI-recommended medical tests based on symptoms")
    public ResponseEntity<AiTestRecommendationResponse> recommendTests(
            @RequestBody SymptomRequest request) {
        return ResponseEntity.ok(aiService.recommendTests(request.getSymptoms()));
    }

    @GetMapping("/nearby-labs")
    @Operation(summary = "Search nearby labs/clinics for a specific test or condition")
    public ResponseEntity<List<NearbyPlaceDTO>> nearbyLabs(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam String query) {
        return ResponseEntity.ok(aiService.recommendNearbyPlaces(query, lat, lng));
    }
}
