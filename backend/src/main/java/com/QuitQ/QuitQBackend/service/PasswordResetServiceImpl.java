package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.PasswordResetToken;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.repository.PasswordResetTokenRepository;
import com.QuitQ.QuitQBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final Logger log = Logger.getLogger(PasswordResetServiceImpl.class.getName());

    // These are still here ONLY if you want token-based resets
    @Value("${app.reset-token-expiry-minutes:60}")
    private long tokenExpiryMinutes;

    public PasswordResetServiceImpl(UserRepository userRepository,
                                    PasswordResetTokenRepository tokenRepository) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
    }

    /**
     * Create token & store it. (NO EMAIL SENT)
     */
    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existing email: " + email);
            return;
        }

        User user = userOpt.get();

        // Invalidate previous tokens
        tokenRepository.findTopByUserOrderByCreatedAtDesc(user).ifPresent(prev -> {
            prev.setUsed(true);
            tokenRepository.save(prev);
        });

        // Create raw token & hashed token
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String hashed = encoder.encode(rawToken);

        PasswordResetToken prt = new PasswordResetToken();
        prt.setUser(user);
        prt.setTokenHash(hashed);
        prt.setExpiresAt(LocalDateTime.now().plusMinutes(tokenExpiryMinutes));
        prt.setUsed(false);
        tokenRepository.save(prt);

        // Log it (since no email is sent)
        log.info("Generated password reset token for user: " + user.getEmail());
        log.info("RAW TOKEN (for testing): " + rawToken);
    }

    /**
     * Validate token & change password
     */
    @Override
    @Transactional
    public boolean resetPassword(String rawToken, String email, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findTopByUserOrderByCreatedAtDesc(user);
        if (tokenOpt.isEmpty()) return false;

        PasswordResetToken prt = tokenOpt.get();

        if (prt.isUsed()) return false;
        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) return false;

        // Validate token
        if (!encoder.matches(rawToken, prt.getTokenHash())) return false;

        // Reset password
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        // Mark used
        prt.setUsed(true);
        tokenRepository.save(prt);

        return true;
    }
}
