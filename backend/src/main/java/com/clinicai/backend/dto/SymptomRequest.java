package com.clinicai.backend.dto;

import lombok.Data;

@Data
public class SymptomRequest {
    private String symptoms;
    private Double latitude;
    private Double longitude;
}
