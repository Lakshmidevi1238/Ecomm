package com.QuitQ.QuitQBackend.controller;

import com.QuitQ.QuitQBackend.config.JwtUtil;
import com.QuitQ.QuitQBackend.dto.*;
import com.QuitQ.QuitQBackend.model.Role;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.service.PasswordResetService;
import com.QuitQ.QuitQBackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.QuitQ.QuitQBackend.dto.SimpleResetRequest;


import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordResetService passwordResetService;

    @Value("${app.allowAdminRegistration:false}")
    private boolean allowAdminRegistration;

    // ---------- Register ----------
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userService.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(req.getPassword());
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());

        String requested = req.getRole();
        Role finalRole = Role.ROLE_USER;

        if (requested != null) {
            String r = requested.trim().toUpperCase();
            if (r.equals("SELLER") || r.equals("ROLE_SELLER")) {
                finalRole = Role.ROLE_SELLER;
            } else if (r.equals("ADMIN") || r.equals("ROLE_ADMIN")) {
                if (allowAdminRegistration) finalRole = Role.ROLE_ADMIN;
                else finalRole = Role.ROLE_USER;
            } else {
                finalRole = Role.ROLE_USER;
            }
        } else {
            finalRole = Role.ROLE_USER;
        }

        user.setRole(finalRole);

        User saved = userService.register(user);

        UserDto ud = new UserDto();
        ud.setId(saved.getId());
        ud.setName(saved.getName());
        ud.setEmail(saved.getEmail());
        ud.setPhone(saved.getPhone());
        ud.setAddress(saved.getAddress());
        ud.setRole(saved.getRole().name());

        return ResponseEntity.ok(ud);
    }

    // ---------- Login ----------
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();

            User u = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtUtil.generateToken(email, u.getRole().name());
            AuthResponse resp = new AuthResponse(token, jwtUtil.getExpirationMs(), u.getRole().name(), u.getId());

            return ResponseEntity.ok(resp);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body("Invalid credentials");
        } catch (DisabledException ex) {
            return ResponseEntity.status(403).body("User disabled");
        }
    }

    // ---------- Me (whoami) ----------
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        var roles = authentication.getAuthorities()
                .stream()
                .map(a -> a.getAuthority())
                .toList();

        var body = Map.of(
                "authenticated", authentication.isAuthenticated(),
                "principal", authentication.getName(),
                "roles", roles
        );

        return ResponseEntity.ok(body);
    }

    // Simple: POST /forgot-password with { email, password } -> updates password immediately
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPasswordSimple(@RequestBody SimpleResetRequest req) {
        try {
            boolean updated = userService.resetPasswordByEmail(req.getEmail(), req.getPassword());
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
            } else {
                return ResponseEntity.status(404).body(Map.of("message", "Email not found."));
            }
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Server error"));
        }
    }


    // ---------- Reset Password ----------
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        boolean ok = passwordResetService.resetPassword(req.getToken(), req.getEmail(), req.getPassword());
        if (ok) {
            return ResponseEntity.ok(Map.of("message", "Password reset successful."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token."));
        }
    }
}
