package com.QuitQ.QuitQBackend.config;

import com.QuitQ.QuitQBackend.model.Role;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    ApplicationRunner initAdmin(UserRepository repo, PasswordEncoder encoder,
                                @Value("${admin.email}") String adminEmail,
                                @Value("${admin.password}") String adminPassword) {
        return args -> {
            if (repo.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(encoder.encode(adminPassword));
                admin.setRole(Role.ROLE_ADMIN);
                admin.setActive(true);
                repo.save(admin);
                System.out.println("Default Admin account created: " + adminEmail);
            }
        };
    }
}
