package com.clinicai.backend.service;

import com.clinicai.backend.dto.MedicalTestDTO;
import com.clinicai.backend.model.MedicalTest;
import com.clinicai.backend.repository.MedicalTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedicalTestService {

    private final MedicalTestRepository medicalTestRepository;

    public List<MedicalTestDTO> getAllTests() {
        return medicalTestRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public List<MedicalTestDTO> getByCategory(String category) {
        return medicalTestRepository.findByCategoryIgnoreCase(category).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<MedicalTestDTO> searchTests(String query) {
        return medicalTestRepository.searchTests(query).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<String> getAllTestNames() {
        return medicalTestRepository.findAll().stream()
                .map(MedicalTest::getTestName)
                .toList();
    }

    public List<MedicalTestDTO> findByNames(List<String> testNames) {
        List<String> lowerNames = testNames.stream()
                .map(String::toLowerCase)
                .toList();
        return medicalTestRepository.findByTestNameInIgnoreCase(lowerNames).stream()
                .map(this::toDTO)
                .toList();
    }

    private MedicalTestDTO toDTO(MedicalTest test) {
        return MedicalTestDTO.builder()
                .id(test.getId())
                .testName(test.getTestName())
                .category(test.getCategory())
                .typicalMinPrice(test.getTypicalMinPrice())
                .typicalMaxPrice(test.getTypicalMaxPrice())
                .description(test.getDescription())
                .build();
    }
}
