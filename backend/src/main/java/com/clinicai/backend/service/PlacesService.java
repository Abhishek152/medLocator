package com.clinicai.backend.service;

import com.clinicai.backend.dto.NearbyPlaceDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
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
                .baseUrl("https://places.googleapis.com/v1")
                .build();
    }

    /**
     * Search nearby clinics/labs using Google Places API (New) - places:searchText
     */
    public List<NearbyPlaceDTO> searchNearby(double lat, double lng, String query, int radiusM) {
        Map<String, NearbyPlaceDTO> uniquePlaces = new LinkedHashMap<>();

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("textQuery", (query != null && !query.isBlank()) ? query : "clinic");
            requestBody.put("maxResultCount", 20);

            Map<String, Object> center = new HashMap<>();
            center.put("latitude", lat);
            center.put("longitude", lng);

            Map<String, Object> circle = new HashMap<>();
            circle.put("center", center);
            circle.put("radius", (double) (radiusM > 0 ? radiusM : 5000));

            Map<String, Object> locationBias = new HashMap<>();
            locationBias.put("circle", circle);
            requestBody.put("locationBias", locationBias);

            String response = webClient.post()
                    .uri("/places:searchText")
                    .header("X-Goog-Api-Key", apiKey)
                    .header("X-Goog-FieldMask", "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                JsonNode placesNode = root.path("places");
                if (placesNode.isArray()) {
                    for (JsonNode place : placesNode) {
                        NearbyPlaceDTO dto = parsePlace(place, lat, lng);
                        if (dto != null) {
                            uniquePlaces.putIfAbsent(dto.getPlaceId(), dto);
                        }
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error calling Places API (New) for query='{}': {}", query, e.getMessage());
        }

        List<NearbyPlaceDTO> results = new ArrayList<>(uniquePlaces.values());
        results.sort(Comparator.comparingDouble(NearbyPlaceDTO::getDistanceKm));

        log.info("Search returned {} results for query='{}' at ({},{})", results.size(), query, lat, lng);
        return results;
    }

    /**
     * Get detailed info for a specific place using Places API (New)
     */
    public NearbyPlaceDTO getPlaceDetails(String placeId) {
        return getPlaceDetails(placeId, null, null);
    }

    public NearbyPlaceDTO getPlaceDetails(String placeId, Double userLat, Double userLng) {
        try {
            String response = webClient.get()
                    .uri("/places/" + placeId)
                    .header("X-Goog-Api-Key", apiKey)
                    .header("X-Goog-FieldMask", "id,displayName,formattedAddress,rating,userRatingCount,nationalPhoneNumber,location,regularOpeningHours,photos,reviews")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null) {
                return null;
            }

            NearbyPlaceDTO details = parsePlaceDetails(response);
            if (details != null && userLat != null && userLng != null) {
                double distance = calculateDistance(userLat, userLng, details.getLatitude(), details.getLongitude());
                details.setDistanceKm(Math.round(distance * 10.0) / 10.0);
            }
            return details;
        } catch (Exception e) {
            log.error("Failed to fetch Place Details for placeId {}: {}", placeId, e.getMessage());
            return null;
        }
    }

    // ---- Parsing ----

    private NearbyPlaceDTO parsePlace(JsonNode place, double userLat, double userLng) {
        try {
            double placeLat = place.path("location").path("latitude").asDouble();
            double placeLng = place.path("location").path("longitude").asDouble();
            double distance = calculateDistance(userLat, userLng, placeLat, placeLng);

            String photoUrl = null;
            JsonNode photos = place.path("photos");
            if (photos.isArray() && !photos.isEmpty()) {
                String photoName = photos.get(0).path("name").asText();
                if (!photoName.isBlank()) {
                    photoUrl = "https://places.googleapis.com/v1/" + photoName + "/media?maxHeightPx=400&maxWidthPx=400&key=" + apiKey;
                }
            }

            String name = place.path("displayName").path("text").asText("");
            if (name.isBlank()) {
                name = place.path("name").asText();
            }

            boolean isOpen = place.path("regularOpeningHours").path("openNow").asBoolean(false);

            return NearbyPlaceDTO.builder()
                    .placeId(place.path("id").asText())
                    .name(name)
                    .address(place.path("formattedAddress").asText())
                    .rating(place.path("rating").asDouble(0.0))
                    .userRatingsTotal(place.path("userRatingCount").asInt(0))
                    .latitude(placeLat)
                    .longitude(placeLng)
                    .distanceKm(Math.round(distance * 10.0) / 10.0)
                    .isOpen(isOpen)
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

            String photoUrl = null;
            JsonNode photos = root.path("photos");
            if (photos.isArray() && !photos.isEmpty()) {
                String photoName = photos.get(0).path("name").asText();
                if (!photoName.isBlank()) {
                    photoUrl = "https://places.googleapis.com/v1/" + photoName + "/media?maxHeightPx=400&maxWidthPx=400&key=" + apiKey;
                }
            }

            double lat = root.path("location").path("latitude").asDouble();
            double lng = root.path("location").path("longitude").asDouble();

            List<String> reviewsList = new ArrayList<>();
            JsonNode reviewsNode = root.path("reviews");
            if (reviewsNode.isArray()) {
                for (JsonNode review : reviewsNode) {
                    String text = review.path("text").path("text").asText("");
                    if (text.isBlank()) {
                        text = review.path("originalText").path("text").asText("");
                    }
                    if (text.isBlank()) {
                        text = review.path("text").asText("");
                    }
                    if (!text.isBlank()) {
                        reviewsList.add(text);
                    }
                }
            }

            String name = root.path("displayName").path("text").asText("");
            if (name.isBlank()) {
                name = root.path("name").asText();
            }

            String phone = root.has("nationalPhoneNumber")
                    ? root.path("nationalPhoneNumber").asText(null)
                    : (root.has("internationalPhoneNumber") ? root.path("internationalPhoneNumber").asText(null) : null);

            boolean isOpen = root.path("regularOpeningHours").path("openNow").asBoolean(false);

            return NearbyPlaceDTO.builder()
                    .placeId(root.path("id").asText())
                    .name(name)
                    .address(root.path("formattedAddress").asText())
                    .rating(root.path("rating").asDouble(0.0))
                    .userRatingsTotal(root.path("userRatingCount").asInt(0))
                    .phoneNumber(phone)
                    .latitude(lat)
                    .longitude(lng)
                    .isOpen(isOpen)
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
