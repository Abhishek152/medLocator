package com.clinicai.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    private String placeId;

    @NotBlank(message = "clinicName is required")
    private String clinicName;

    private String clinicAddress;

    private String clinicPhone;

    private String doctorName;

    @NotNull(message = "appointmentTime is required")
    @Future(message = "appointmentTime must be a future date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentTime;

    private String notes;
}
