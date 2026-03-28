package com.clinicai.backend.service;

import com.clinicai.backend.dto.NearbyPlaceDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
@Slf4j
public class PlacesService {

    private final WebClient webClient;
    private final String apiKey;
    private final ObjectMapper objectMapper;

    public PlacesService(
            @Value("${google.places.api-key}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl("https://maps.googleapis.com/maps/api/place")
                .build();
    }

    /**
     * Simple, direct search: sends the query as-is to Google Places
     * with pagination (up to 60 results). No extra fan-out queries.
     */
    public List<NearbyPlaceDTO> searchNearby(double lat, double lng, String query, int radiusM) {
        Map<String, NearbyPlaceDTO> uniquePlaces = new LinkedHashMap<>();
        String pageToken = null;

        for (int page = 0; page < 3; page++) {
            try {
                final String token = pageToken;
                String response = webClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path("/nearbysearch/json")
                                    .queryParam("location", lat + "," + lng)
                                    .queryParam("radius", radiusM)
                                    .queryParam("keyword", query)
                                    .queryParam("key", apiKey);
                            if (token != null) {
                                builder.queryParam("pagetoken", token);
                            }
                            return builder.build();
                        })
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                JsonNode root = objectMapper.readTree(response);
                String status = root.path("status").asText();

                if (!"OK".equals(status) && !"ZERO_RESULTS".equals(status)) {
                    log.warn("Places API status={} for query='{}'", status, query);
                    break;
                }

                for (JsonNode place : root.path("results")) {
                    NearbyPlaceDTO dto = parsePlace(place, lat, lng);
                    if (dto != null) {
                        uniquePlaces.putIfAbsent(dto.getPlaceId(), dto);
                    }
                }

                // Check for next page
                pageToken = root.has("next_page_token") && !root.path("next_page_token").asText().isBlank()
                        ? root.path("next_page_token").asText()
                        : null;

                if (pageToken == null) break;

                // Google requires ~2s before next_page_token is valid
                Thread.sleep(2000);

            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("Error fetching page {} for query='{}': {}", page, query, e.getMessage());
                break;
            }
        }

        List<NearbyPlaceDTO> results = new ArrayList<>(uniquePlaces.values());
        results.sort(Comparator.comparingDouble(NearbyPlaceDTO::getDistanceKm));

        log.info("Search returned {} results for query='{}' at ({},{})", results.size(), query, lat, lng);
        return results;
    }

    /**
     * Get detailed info for a specific place.
     */
    public NearbyPlaceDTO getPlaceDetails(String placeId) {
        return getPlaceDetails(placeId, null, null);
    }

    public NearbyPlaceDTO getPlaceDetails(String placeId, Double userLat, Double userLng) {
        String response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/details/json")
                        .queryParam("place_id", placeId)
                        .queryParam("fields", "name,formatted_address,formatted_phone_number,rating,user_ratings_total,geometry,opening_hours,photos,place_id,reviews")
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        NearbyPlaceDTO details = parsePlaceDetails(response);
        if (details != null && userLat != null && userLng != null) {
            double distance = calculateDistance(userLat, userLng, details.getLatitude(), details.getLongitude());
            details.setDistanceKm(Math.round(distance * 10.0) / 10.0);
        }
        return details;
    }

    // ---- Parsing ----

    private NearbyPlaceDTO parsePlace(JsonNode place, double userLat, double userLng) {
        try {
            double placeLat = place.path("geometry").path("location").path("lat").asDouble();
            double placeLng = place.path("geometry").path("location").path("lng").asDouble();
            double distance = calculateDistance(userLat, userLng, placeLat, placeLng);

            String photoUrl = null;
            JsonNode photos = place.path("photos");
            if (photos.isArray() && !photos.isEmpty()) {
                String photoRef = photos.get(0).path("photo_reference").asText();
                photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=" + photoRef + "&key=" + apiKey;
            }

            return NearbyPlaceDTO.builder()
                    .placeId(place.path("place_id").asText())
                    .name(place.path("name").asText())
                    .address(place.path("vicinity").asText())
                    .rating(place.path("rating").asDouble(0))
                    .userRatingsTotal(place.path("user_ratings_total").asInt(0))
                    .latitude(placeLat)
                    .longitude(placeLng)
                    .distanceKm(Math.round(distance * 10.0) / 10.0)
                    .isOpen(place.path("opening_hours").path("open_now").asBoolean(false))
                    .photoUrl(photoUrl)
                    .build();
        } catch (Exception e) {
            log.warn("Failed to parse place: {}", e.getMessage());
            return null;
        }
    }

    private NearbyPlaceDTO parsePlaceDetails(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode result = root.path("result");

            String photoUrl = null;
            JsonNode photos = result.path("photos");
            if (photos.isArray() && !photos.isEmpty()) {
                String photoRef = photos.get(0).path("photo_reference").asText();
                photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=" + photoRef + "&key=" + apiKey;
            }

            double lat = result.path("geometry").path("location").path("lat").asDouble();
            double lng = result.path("geometry").path("location").path("lng").asDouble();

            List<String> reviewsList = new ArrayList<>();
            JsonNode reviewsNode = result.path("reviews");
            if (reviewsNode.isArray()) {
                for (JsonNode review : reviewsNode) {
                    String text = review.path("text").asText("");
                    if (!text.isBlank()) {
                        reviewsList.add(text);
                    }
                }
            }

            return NearbyPlaceDTO.builder()
                    .placeId(result.path("place_id").asText())
                    .name(result.path("name").asText())
                    .address(result.path("formatted_address").asText())
                    .rating(result.path("rating").asDouble(0))
                    .userRatingsTotal(result.path("user_ratings_total").asInt(0))
                    .phoneNumber(result.path("formatted_phone_number").asText(null))
                    .latitude(lat)
                    .longitude(lng)
                    .isOpen(result.path("opening_hours").path("open_now").asBoolean(false))
                    .photoUrl(photoUrl)
                    .reviews(reviewsList)
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse Place Details: {}", e.getMessage(), e);
            return null;
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
