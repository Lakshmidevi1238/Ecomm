package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User register(User user);         
    String login(String email, String rawPassword); 
    Optional<User> findByEmail(String email);
    User findById(Long id);
    User updateUser(Long id, User update);
    void deleteUser(Long id);

    List<User> listAllUsers();
    User disableUser(Long id);
    
}

