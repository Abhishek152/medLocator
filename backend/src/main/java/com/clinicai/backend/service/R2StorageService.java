package com.clinicai.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * Supabase Storage service using their REST API.
 * Free tier: 1GB storage, 2GB bandwidth/month.
 * No extra SDK needed — just WebClient.
 */
@Service
@Slf4j
public class R2StorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf", "image/png", "image/jpeg", "image/jpg"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    @Value("${supabase.storage.bucket}")
    private String bucketName;

    private WebClient storageClient;

    @PostConstruct
    public void init() {
        this.storageClient = WebClient.builder()
                .baseUrl(supabaseUrl + "/storage/v1")
                .defaultHeader("Authorization", "Bearer " + serviceKey)
                .defaultHeader("apikey", serviceKey)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
        log.info("Supabase Storage initialized — bucket: {}", bucketName);
    }

    /**
     * Upload a file to Supabase Storage.
     * @return the storage path (key) in Supabase
     */
    public String upload(MultipartFile file, Long userId) throws IOException {
        validateFile(file);

        String extension = getExtension(file.getOriginalFilename());
        String key = String.format("reports/%d/%s.%s", userId, UUID.randomUUID(), extension);

        storageClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/object/{bucket}/" + key)
                        .build(bucketName))
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .bodyValue(file.getBytes())
                .retrieve()
                .toBodilessEntity()
                .block();

        log.info("Uploaded file to Supabase: {}", key);
        return key;
    }

    /**
     * Download file bytes from Supabase (used for AI processing).
     */
    public byte[] download(String key) {
        byte[] data = storageClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/object/{bucket}/" + key)
                        .build(bucketName))
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
        return data;
    }

    /**
     * Generate a temporary signed URL for viewing private files.
     */
    public String getSignedUrl(String key) {
        try {
            java.util.Map<String, Object> response = storageClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/object/sign/{bucket}/" + key) // Append key manually to avoid slash encoding
                            .build(bucketName))
                    .bodyValue(java.util.Map.of("expiresIn", 3600)) // 1 hour
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {})
                    .block();

            if (response != null && response.containsKey("signedURL")) {
                // Ensure the URL is absolute
                String signedPath = (String) response.get("signedURL");
                // The signedURL from Supabase is already correctly encoded for the final GET request
                if (signedPath.startsWith("/")) {
                    return supabaseUrl + "/storage/v1" + signedPath;
                }
                return signedPath;
            }
            return null;
        } catch (Exception e) {
            log.warn("Failed to generate signed URL for key {}: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * Delete a file from Supabase Storage.
     */
    public void delete(String key) {
        try {
            storageClient.delete()
                    .uri(uriBuilder -> uriBuilder
                            .path("/object/{bucket}/" + key)
                            .build(bucketName))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Deleted file from Supabase: {}", key);
        } catch (Exception e) {
            log.warn("Failed to delete file from Supabase: {}", key, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only PDF, PNG, and JPG files are allowed");
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "bin";
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }
}
