package com.clinicai.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ClinicAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicAiApplication.class, args);
    }
}
