package com.clinicai.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI medLocatorOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MedLocator Platform API")
                        .version("v1.0")
                        .description("REST API for searching clinics and managing appointments")
                        .contact(new Contact()
                                .name("MedLocator Team")
                                .email("dev@medlocator.in")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Development"),
                        new Server().url("https://api.medlocator.in").description("Production")
                ));
    }
}
