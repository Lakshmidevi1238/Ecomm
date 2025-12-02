// src/main/java/com/QuitQ/QuitQBackend/config/WebMvcConfig.java
package com.QuitQ.QuitQBackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // Read APP_UPLOAD_DIR environment variable; default to /opt/quitq/uploads inside container
    @Value("${APP_UPLOAD_DIR:/opt/quitq/uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath() + "/";
        registry.addResourceHandler("/uploads/**")
        		.addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600);
    }
}
