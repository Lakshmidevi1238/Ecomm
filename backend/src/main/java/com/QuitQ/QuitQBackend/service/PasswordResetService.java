package com.QuitQ.QuitQBackend.service;

/**
 * Service interface for password reset flow.
 *
 * - requestPasswordReset(email): generate token, persist hashed token and send (or log) reset URL.
 * - resetPassword(rawToken, email, newPassword): validate token for the user and set new password.
 */
public interface PasswordResetService {
    /**
     * Create a password reset token for the given email and send (or log) the reset link.
     * This method MUST NOT reveal whether the email exists (caller should always return a generic response).
     *
     * @param email the user's email (may or may not exist)
     */
    void requestPasswordReset(String email);

    /**
     * Reset the user's password using the provided raw token and email.
     *
     * @param rawToken the raw token received by user (from email / link)
     * @param email the user's email
     * @param newPassword the new plaintext password
     * @return true if reset succeeded, false if token invalid/expired/used or email not found
     */
    boolean resetPassword(String rawToken, String email, String newPassword);
}
