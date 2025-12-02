package com.QuitQ.QuitQBackend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
public class PublicUploadsController {

    @Value("${APP_UPLOAD_DIR:/opt/quitq/uploads}")
    private String uploadsDir;

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<?> serveUpload(@PathVariable String filename) {
        if (filename == null || filename.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "filename required"));
        }
        filename = StringUtils.cleanPath(filename);
        Path file = Paths.get(uploadsDir).resolve(filename).normalize();

        try {
            if (!Files.exists(file) || !Files.isReadable(file)) {
                return ResponseEntity.status(404).body(Map.of("message", "Image file not found"));
            }
            Resource resource = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName().toString() + "\"")
                    .body(resource);
        } catch (MalformedURLException ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to read image"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Unexpected error"));
        }
    }
}
