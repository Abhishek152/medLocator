package com.clinicai.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        e.printStackTrace(); // Log to console for debugging
        return ResponseEntity.status(500).body(Map.of(
                "message", e.getMessage() != null ? e.getMessage() : "An unknown server error occurred"
        ));
    }
}
