package com.clinicai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role; // "PATIENT" or "DOCTOR"
}
