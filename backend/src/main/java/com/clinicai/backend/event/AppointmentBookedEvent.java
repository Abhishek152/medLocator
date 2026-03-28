package com.clinicai.backend.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentBookedEvent {
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private String clinicName;
    private LocalDateTime appointmentTime;
    private String doctorName;
}
