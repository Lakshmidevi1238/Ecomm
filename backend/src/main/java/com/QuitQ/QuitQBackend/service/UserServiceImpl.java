package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.Product;
import org.springframework.beans.factory.annotation.Value;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.repository.ProductRepository;
import com.QuitQ.QuitQBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserServiceImpl implements UserService {
	
	@Value("${admin.email}")
	private String adminEmail;

	@Value("${admin.password}")
	private String adminPassword;

    private final UserRepository repo;
    private final ProductRepository productRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$");

    @Autowired
    public UserServiceImpl(UserRepository repo, ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

  
    @Override
    @Transactional
    public User register(User user) {
      
        if (user.getName() == null || user.getName().isBlank()) {
            throw new IllegalArgumentException("Username must be entered");
        }

        if (user.getEmail() == null || !EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (repo.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (user.getPassword() == null || !PASSWORD_PATTERN.matcher(user.getPassword()).matches()) {
            throw new IllegalArgumentException(
                "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number"
            );
        }
        if (user.getEmail().equals(adminEmail)) {
            throw new IllegalArgumentException("You cannot register with admin email.");
        }

    
        user.setPassword(passwordEncoder.encode(user.getPassword()));

   
        if (user.getRole() == null) {
            user.setRole(com.QuitQ.QuitQBackend.model.Role.ROLE_USER);
        }

        return repo.save(user);
    }

   
    @Override
    public String login(String email, String rawPassword) {
       
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (rawPassword == null || !PASSWORD_PATTERN.matcher(rawPassword).matches()) {
            throw new IllegalArgumentException(
                "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number"
            );
        }
        
        if (email.equals(adminEmail) && rawPassword.equals(adminPassword)) {
           
            return "ADMIN_TOKEN"; 
        }
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }


        return "JWT_PLACEHOLDER";
    }


    @Override
    public Optional<User> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    @Override
    public User findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    @Transactional
    public User updateUser(Long id, User update) {
        User u = findById(id);

        if (update.getName() != null && !update.getName().isBlank()) {
            u.setName(update.getName());
        }

        if (update.getPhone() != null) {
            u.setPhone(update.getPhone());
        }

        if (update.getAddress() != null) {
            u.setAddress(update.getAddress());
        }

        if (update.getPassword() != null && !update.getPassword().isBlank()) {
            if (!PASSWORD_PATTERN.matcher(update.getPassword()).matches()) {
                throw new IllegalArgumentException(
                    "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number"
                );
            }
            u.setPassword(passwordEncoder.encode(update.getPassword()));
        }

        return repo.save(u);
    }

    @Override
    public void deleteUser(Long id) {
        repo.deleteById(id);
    }

    @Override
    public List<User> listAllUsers() {
        return repo.findAll();
    }

    @Override
    @Transactional
    public User disableUser(Long userId) {
        User u = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!u.isActive()) {
            return u;
        }

        u.setActive(false);
        repo.save(u);

        if (u.getRole() != null && "ROLE_SELLER".equals(u.getRole().name())) {
            List<Product> products = productRepo.findBySeller(u);
            for (Product p : products) {
                if (p.isActive()) {
                    p.setActive(false);
                    productRepo.save(p);
                }
            }
        }

        return u;
    }
}
