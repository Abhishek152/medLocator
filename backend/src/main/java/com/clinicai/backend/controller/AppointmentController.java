package com.clinicai.backend.controller;

import com.clinicai.backend.dto.AppointmentDTO;
import com.clinicai.backend.dto.AppointmentRequest;
import com.clinicai.backend.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment booking and management APIs")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Book a new appointment")
    public ResponseEntity<AppointmentDTO> bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {

        AppointmentDTO created = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all appointments for a specific user")
    public ResponseEntity<List<AppointmentDTO>> getUserAppointments(
            @PathVariable Long userId,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(appointmentService.getAppointmentsByUser(userId, status));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<AppointmentDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
    }
}
