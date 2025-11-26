package com.QuitQ.QuitQBackend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String url(String path) {
        return "http://localhost:" + port + "/api/v1/products" + path;
    }

    @Test
    void testGetAllProducts_ShouldReturn200() {
        ResponseEntity<String> response = restTemplate.getForEntity(url(""), String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("name"));
    }

    @Test
    void testGetInvalidProduct_ShouldReturn404() {
        ResponseEntity<String> response = restTemplate.getForEntity(url("/99999"), String.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}

