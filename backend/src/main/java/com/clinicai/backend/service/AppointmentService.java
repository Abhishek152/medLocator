package com.clinicai.backend.service;

import com.clinicai.backend.dto.AppointmentDTO;
import com.clinicai.backend.dto.AppointmentRequest;
import com.clinicai.backend.event.AppointmentBookedEvent;
import com.clinicai.backend.exception.ResourceNotFoundException;
import com.clinicai.backend.kafka.NotificationProducer;
import com.clinicai.backend.model.Appointment;
import com.clinicai.backend.model.User;
import com.clinicai.backend.repository.AppointmentRepository;
import com.clinicai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final NotificationProducer notificationProducer;

    @Transactional
    public AppointmentDTO bookAppointment(AppointmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        Appointment appointment = Appointment.builder()
                .user(user)
                .placeId(request.getPlaceId())
                .clinicName(request.getClinicName())
                .clinicAddress(request.getClinicAddress())
                .clinicPhone(request.getClinicPhone())
                .doctorName(request.getDoctorName())
                .appointmentTime(request.getAppointmentTime())
                .status(Appointment.AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Publish event to Kafka
        AppointmentBookedEvent event = AppointmentBookedEvent.builder()
                .appointmentId(saved.getId())
                .patientId(user.getId())
                .patientName(user.getName())
                .clinicName(saved.getClinicName())
                .doctorName(saved.getDoctorName() != null ? saved.getDoctorName() : "Any Available Doctor")
                .appointmentTime(saved.getAppointmentTime())
                .build();
        notificationProducer.publishAppointmentBooked(event);

        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByUser(Long userId, String status) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        if (status != null && !status.isBlank()) {
            Appointment.AppointmentStatus statusEnum;
            try {
                statusEnum = Appointment.AppointmentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + status +
                        ". Valid values: PENDING, CONFIRMED, CANCELLED, COMPLETED");
            }
            return appointmentRepository
                    .findByUserIdAndStatusOrderByAppointmentTimeDesc(userId, statusEnum)
                    .stream().map(this::toDTO).toList();
        }

        return appointmentRepository
                .findByUserIdOrderByAppointmentTimeDesc(userId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        Appointment.AppointmentStatus statusEnum;
        try {
            statusEnum = Appointment.AppointmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        appointment.setStatus(statusEnum);
        return toDTO(appointmentRepository.save(appointment));
    }

    private AppointmentDTO toDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .userId(appointment.getUser().getId())
                .placeId(appointment.getPlaceId())
                .clinicName(appointment.getClinicName())
                .clinicAddress(appointment.getClinicAddress())
                .clinicPhone(appointment.getClinicPhone())
                .doctorName(appointment.getDoctorName())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
