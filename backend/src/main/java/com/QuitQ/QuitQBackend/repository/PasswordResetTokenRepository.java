package com.QuitQ.QuitQBackend.repository;

import com.QuitQ.QuitQBackend.model.PasswordResetToken;
import com.QuitQ.QuitQBackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByUserOrderByCreatedAtDesc(User user);
}
