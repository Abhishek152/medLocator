package com.clinicai.backend.controller;

import com.clinicai.backend.dto.MedicalTestDTO;
import com.clinicai.backend.service.MedicalTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
@Tag(name = "Medical Tests", description = "Medical test catalog with pricing")
public class MedicalTestController {

    private final MedicalTestService medicalTestService;

    @GetMapping
    @Operation(summary = "Get all medical tests, optionally filtered by category")
    public ResponseEntity<List<MedicalTestDTO>> getTests(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(medicalTestService.getByCategory(category));
        }
        return ResponseEntity.ok(medicalTestService.getAllTests());
    }

    @GetMapping("/search")
    @Operation(summary = "Search medical tests by name or keyword")
    public ResponseEntity<List<MedicalTestDTO>> searchTests(@RequestParam String q) {
        return ResponseEntity.ok(medicalTestService.searchTests(q));
    }
}
