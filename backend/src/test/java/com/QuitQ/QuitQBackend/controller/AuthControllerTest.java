package com.QuitQ.QuitQBackend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String url(String path) {
        return "http://localhost:" + port + "/api/v1/auth" + path;
    }

    @Test
    void testRegisterUser_ShouldReturn200() {
        String json = """
            {
              "name": "Test User2",
              "email": "testuser2@example.com",
              "password": "Test1234",
              "phone": "9999999999",
              "address": "Test Street",
              "role": "ROLE_USER"
            }
            """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(json, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url("/register"), request, String.class);

        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertTrue(response.getBody().contains("email"));
    }

    @Test
    void testLoginWithInvalidCredentials_ShouldReturn401() {
        String json = """
            {"email": "wrong@example.com", "password": "badpass"}
            """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(json, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url("/login"), request, String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}

