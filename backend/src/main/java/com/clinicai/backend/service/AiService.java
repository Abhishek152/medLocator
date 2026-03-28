package com.clinicai.backend.service;

import com.clinicai.backend.dto.AiTestRecommendationResponse;
import com.clinicai.backend.dto.MedicalTestDTO;
import com.clinicai.backend.dto.NearbyPlaceDTO;
import com.clinicai.backend.model.MedicalTest;
import com.clinicai.backend.repository.MedicalTestRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AiService {

    private final MedicalTestRepository medicalTestRepository;
    private final PlacesService placesService;
    private final WebClient groqClient;
    private final ObjectMapper objectMapper;
    private final String groqApiKey;

    public AiService(
            MedicalTestRepository medicalTestRepository,
            PlacesService placesService,
            @Value("${groq.api-key}") String groqApiKey,
            ObjectMapper objectMapper) {
        this.medicalTestRepository = medicalTestRepository;
        this.placesService = placesService;
        this.groqApiKey = groqApiKey;
        this.objectMapper = objectMapper;
        this.groqClient = WebClient.builder()
                .baseUrl("https://api.groq.com/openai/v1/chat/completions")
                .build();
    }

    /**
     * AI Symptom → Test Recommender
     * Calls Groq API to analyze symptoms and suggest medical tests from our catalog.
     */
    public AiTestRecommendationResponse recommendTests(String symptoms) {
        try {
            List<String> allTestNames = medicalTestRepository.findAll().stream()
                    .map(MedicalTest::getTestName)
                    .toList();

            String prompt = buildTestRecommendationPrompt(symptoms, allTestNames);
            String aiResponse = callGroqApi(prompt);

            return parseTestRecommendation(aiResponse, symptoms);
        } catch (Exception e) {
            log.error("Groq API or parsing failed for symptoms '{}': {}", symptoms, e.getMessage());
            return buildFallbackResponse(symptoms);
        }
    }

    /**
     * Search for nearby clinics/labs that match a query using Google Places API.
     */
    public List<NearbyPlaceDTO> recommendNearbyPlaces(String query, double lat, double lng) {
        return placesService.searchNearby(lat, lng, query, 5000);
    }

    private String buildTestRecommendationPrompt(String symptoms, List<String> testNames) {
        String testList = String.join(", ", testNames);
        return String.format("""
            SYSTEM: You are a professional medical diagnostic assistant. Your goal is to analyze patient symptoms and recommend the most clinically relevant diagnostic tests from a specific catalog.
            
            CATALOG OF AVAILABLE TESTS:
            [%s]
            
            USER SYMPTOMS:
            "%s"
            
            INSTRUCTIONS:
            1. Analyze the symptoms carefully.
            2. Select exactly 3-4 most relevant tests from the CATALOG above.
            3. Provide a concise, professional explanation for each recommendation.
            4. Use the EXACT test names as they appear in the catalog.
            
            RESPONSE FORMAT (JSON ONLY):
            {
              "explanation": "A combined 2-3 sentence clinical rationale for the recommended tests.",
              "tests": ["Exact Test Name 1", "Exact Test Name 2", "Exact Test Name 3"]
            }
            """, testList, symptoms);
    }

    private String callGroqApi(String prompt) throws Exception {
        String requestBody = objectMapper.writeValueAsString(Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", prompt
                )),
                "temperature", 0.1,
                "max_tokens", 1024
        ));

        String response = groqClient.post()
                .header("Authorization", "Bearer " + groqApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Extract text from Groq response (OpenAI layout)
        JsonNode root = objectMapper.readTree(response);
        return root.path("choices").get(0)
                .path("message").path("content").asText();
    }

    private AiTestRecommendationResponse parseTestRecommendation(String aiResponse, String symptoms) throws Exception {
        // Clean response — remove code blocks if present
        String cleaned = aiResponse.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode json = objectMapper.readTree(cleaned);
        String explanation = json.path("explanation").asText("");
        if (explanation.isEmpty()) {
            explanation = "Based on your symptoms, here are the recommended tests.";
        }

        List<String> testNames = new ArrayList<>();
        JsonNode testsNode = json.path("tests");
        if (testsNode.isArray()) {
            for (JsonNode t : testsNode) {
                testNames.add(t.asText().toLowerCase());
            }
        }

        // Match AI-suggested test names to our catalog
        List<MedicalTestDTO> matchedTests = medicalTestRepository
                .findByTestNameInIgnoreCase(testNames)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        // If exact match fails, try keyword search as fallback
        if (matchedTests.isEmpty() && !testNames.isEmpty()) {
            for (String name : testNames) {
                List<MedicalTest> searched = medicalTestRepository.searchTests(name);
                matchedTests.addAll(searched.stream().map(this::toDTO).toList());
            }
            // Deduplicate
            matchedTests = matchedTests.stream()
                    .collect(Collectors.toMap(MedicalTestDTO::getId, t -> t, (a, b) -> a))
                    .values().stream().toList();
        }

        return AiTestRecommendationResponse.builder()
                .aiExplanation(explanation)
                .suggestedTests(matchedTests)
                .build();
    }

    private AiTestRecommendationResponse buildFallbackResponse(String symptoms) {
        // Fallback: keyword search from symptoms directly
        String[] words = symptoms.split("\\s+");
        List<MedicalTestDTO> fallbackTests = new ArrayList<>();
        
        // Rank tests by how many symptom words match their keywords/name
        Map<MedicalTestDTO, Integer> testWeights = new HashMap<>();

        for (String word : words) {
            String cleanWord = word.toLowerCase().replaceAll("[^a-z]", "");
            if (cleanWord.length() > 3) {
                List<MedicalTest> matches = medicalTestRepository.searchTests(cleanWord);
                for (MedicalTest match : matches) {
                    MedicalTestDTO dto = toDTO(match);
                    testWeights.put(dto, testWeights.getOrDefault(dto, 0) + 1);
                }
            }
        }

        if (testWeights.isEmpty()) {
            // Very basic fallback if symptom matching fails completely
            medicalTestRepository.searchTests("blood").stream()
                    .limit(3)
                    .map(this::toDTO)
                    .forEach(dto -> testWeights.put(dto, 1));
        }

        // Sort by weight descending and limit to top 3
        fallbackTests = testWeights.entrySet().stream()
                .sorted(Map.Entry.<MedicalTestDTO, Integer>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .limit(3)
                .toList();

        return AiTestRecommendationResponse.builder()
                .aiExplanation("Based on the symptoms you've described, here are some commonly recommended diagnostic tests. You can find nearby labs for each of these tests below.")
                .suggestedTests(fallbackTests)
                .build();
    }

    /**
     * AI Review Summarizer
     * Analyzes Google reviews and extracts a list of Pros and Cons.
     */
    public void summarizeClinicReviews(NearbyPlaceDTO clinic) {
        if (clinic.getReviews() == null || clinic.getReviews().isEmpty()) {
            clinic.setPros(Collections.emptyList());
            clinic.setCons(Collections.emptyList());
            return;
        }

        try {
            String reviewsText = String.join("\n---\n", clinic.getReviews());
            String prompt = String.format("""
                You are an expert healthcare quality analyst. Analyze the following patient reviews for a medical clinic/lab:
                
                REVIEWS:
                %s
                
                Extract 3-4 distinct "Pros" and 2-3 distinct "Cons" (if any) from these reviews. 
                Focus on: wait times, staff behavior, cleanliness, pricing, and accuracy.
                
                Respond in this EXACT JSON format ONLY (no markdown, no other text):
                {
                  "pros": ["Pro 1", "Pro 2", "Pro 3"],
                  "cons": ["Con 1", "Con 2"]
                }
                """, reviewsText);

            String aiResponse = callGroqApi(prompt);
            
            // Clean and parse
            String cleaned = aiResponse.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
            }
            
            JsonNode json = objectMapper.readTree(cleaned);
            List<String> pros = new ArrayList<>();
            List<String> cons = new ArrayList<>();
            
            if (json.has("pros") && json.get("pros").isArray()) {
                json.get("pros").forEach(node -> pros.add(node.asText()));
            }
            if (json.has("cons") && json.get("cons").isArray()) {
                json.get("cons").forEach(node -> cons.add(node.asText()));
            }
            
            clinic.setPros(pros);
            clinic.setCons(cons);

        } catch (Exception e) {
            log.error("Failed to summarize reviews for clinic {}: {}", clinic.getName(), e.getMessage());
            clinic.setPros(Collections.emptyList());
            clinic.setCons(Collections.emptyList());
        }
    }

    private MedicalTestDTO toDTO(MedicalTest test) {
        return MedicalTestDTO.builder()
                .id(test.getId())
                .testName(test.getTestName())
                .category(test.getCategory())
                .typicalMinPrice(test.getTypicalMinPrice())
                .typicalMaxPrice(test.getTypicalMaxPrice())
                .description(test.getDescription())
                .keywords(test.getKeywords())
                .build();
    }
}
