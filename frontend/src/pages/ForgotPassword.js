import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "../styles/forgotpassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState("");

  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!password.trim() || password.length < 8)
      return "Password must be at least 8 characters long.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const err = validate();
    if (err) return setError(err);

    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
        password,
      });

      // ✅ Using response (removes warning)
      setMessage(response.data || "Password updated successfully!");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        Back
      </button>

      <h2 className="login-title">Reset Password</h2>

      <form onSubmit={handleSubmit} className="login-form">
        {/* EMAIL */}
        <div className="input-group">
          <input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>

        {/* NEW PASSWORD */}
        <div className="input-group">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="input-group">
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="form-input"
          />
        </div>

        <p className="error-text">{error || " "}</p>

        {message && <p className="success-text">{message}</p>}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
