package com.clinicai.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class NearbyPlaceDTO {
    private String placeId;
    private String name;
    private String address;
    private double rating;
    private int userRatingsTotal;
    private String phoneNumber;
    private double latitude;
    private double longitude;
    private double distanceKm;
    private boolean isOpen;
    private String photoUrl;

    // New fields for AI review analysis
    private List<String> reviews;
    private List<String> pros;
    private List<String> cons;
}
