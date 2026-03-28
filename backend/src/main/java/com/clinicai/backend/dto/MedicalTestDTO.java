package com.clinicai.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicalTestDTO {
    private Long id;
    private String testName;
    private String category;
    private int typicalMinPrice;
    private int typicalMaxPrice;
    private String description;
    private String keywords;
}
