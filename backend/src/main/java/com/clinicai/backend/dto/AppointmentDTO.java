package com.clinicai.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.clinicai.backend.model.Appointment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AppointmentDTO {
    private Long id;
    private Long userId;
    private String placeId;
    private String clinicName;
    private String clinicAddress;
    private String clinicPhone;
    private String doctorName;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentTime;

    private Appointment.AppointmentStatus status;
    private String notes;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
