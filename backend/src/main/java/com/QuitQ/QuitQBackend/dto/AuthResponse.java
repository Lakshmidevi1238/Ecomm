// AuthResponse.java
package com.QuitQ.QuitQBackend.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long expiresInMs;
    private String role;
    private Long userId;

    public AuthResponse() {}
    public AuthResponse(String token, Long expiresInMs, String role, Long userId) {
        this.token = token;
        this.expiresInMs = expiresInMs;
        this.role = role;
        this.userId = userId;
    }

    // getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getExpiresInMs() { return expiresInMs; }
    public void setExpiresInMs(Long expiresInMs) { this.expiresInMs = expiresInMs; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
