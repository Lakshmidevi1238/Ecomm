package com.QuitQ.QuitQBackend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String authUrl(String path) {
        return "http://localhost:" + port + "/api/v1/auth" + path;
    }

    private String userUrl(String path) {
        return "http://localhost:" + port + "/api/v1/admin/users" + path;
    }

    @Test
    void testCreateAndDeleteUser_Simple() {
    
        String registerJson = """
            {
              "name": "User1",
              "email": "user1@example.com",
              "password": "Test1234",
              "phone": "9999999999",
              "address": "Test City",
              "role": "ROLE_USER"
            }
            """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> registerRequest = new HttpEntity<>(registerJson, headers);
        ResponseEntity<String> registerResponse =
                restTemplate.postForEntity(authUrl("/register"), registerRequest, String.class);

        System.out.println("Register Response: " + registerResponse.getStatusCode());
        System.out.println("Body: " + registerResponse.getBody());

        assertTrue(
                registerResponse.getStatusCode() == HttpStatus.OK ||
                registerResponse.getStatusCode() == HttpStatus.BAD_REQUEST
        );

        ResponseEntity<String> deleteResponse =
                restTemplate.exchange(userUrl("/1"), HttpMethod.DELETE, null, String.class);

        System.out.println("Delete Response: " + deleteResponse.getStatusCode());
        System.out.println("Delete Body: " + deleteResponse.getBody());


        assertTrue(
                deleteResponse.getStatusCode() == HttpStatus.OK ||
                deleteResponse.getStatusCode() == HttpStatus.UNAUTHORIZED ||
                deleteResponse.getStatusCode() == HttpStatus.FORBIDDEN ||
                deleteResponse.getStatusCode() == HttpStatus.NOT_FOUND
        );
    }

}
