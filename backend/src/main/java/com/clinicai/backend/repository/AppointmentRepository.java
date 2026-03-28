package com.clinicai.backend.repository;

import com.clinicai.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserIdOrderByAppointmentTimeDesc(Long userId);

    List<Appointment> findByUserIdAndStatusOrderByAppointmentTimeDesc(
            Long userId, Appointment.AppointmentStatus status);
}
