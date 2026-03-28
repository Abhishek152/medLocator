package com.clinicai.backend.controller;

import com.clinicai.backend.dto.NearbyPlaceDTO;
import com.clinicai.backend.service.AiService;
import com.clinicai.backend.service.PlacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
@Tag(name = "Places", description = "Dynamic clinic/lab search via Google Places API")
public class PlacesController {

    private final PlacesService placesService;
    private final AiService aiService;

    @GetMapping("/nearby")
    @Operation(summary = "Search nearby clinics/labs based on location and query")
    public ResponseEntity<List<NearbyPlaceDTO>> searchNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam String query,
            @RequestParam(defaultValue = "5000") int radius) {

        List<NearbyPlaceDTO> results = placesService.searchNearby(lat, lng, query, radius);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{placeId}")
    @Operation(summary = "Get detailed information about a specific place")
    public ResponseEntity<NearbyPlaceDTO> getPlaceDetails(
            @PathVariable String placeId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {

        NearbyPlaceDTO details = (lat != null && lng != null)
                ? placesService.getPlaceDetails(placeId, lat, lng)
                : placesService.getPlaceDetails(placeId);

        if (details == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Add AI summary of reviews
        if (details.getReviews() != null && !details.getReviews().isEmpty()) {
            aiService.summarizeClinicReviews(details);
        }
        
        return ResponseEntity.ok(details);
    }
}
