package com.QuitQ.QuitQBackend.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.service.UserService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/admin/users")
    public ResponseEntity<?> listAllUsers() {
        List<User> users = userService.listAllUsers();
        List<Object> out = users.stream().map(u -> Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole() == null ? null : u.getRole().name(),
                "active", u.isActive()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }


    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> disableUser(@PathVariable("id") Long id) {
        try {
            User u = userService.disableUser(id);
            return ResponseEntity.ok(Map.of("message", "User disabled", "id", u.getId()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }
}
