import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState("ROLE_USER");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email))
      newErrors.email = "Invalid email format.";

    if (!form.password.trim()) newErrors.password = "Password is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        {
          email: form.email,
          password: form.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token, role, userId, name } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      localStorage.setItem("name", name);

      if (role === "ROLE_SELLER") navigate("/seller/home");
      else if (role === "ROLE_ADMIN") navigate("/admin/home");
      else navigate("/user/home");
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setErrors({ api: err.response?.data?.message || "Invalid credentials." });
    }
  };

  const handleBack = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="login-container">
      <button onClick={handleBack} className="back-btn">
        Back
      </button>

      <h2 className="login-title">Login</h2>

     
      <div className="role-toggle">
        {["ROLE_USER", "ROLE_SELLER", "ROLE_ADMIN"].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`role-btn ${selectedRole === role ? "active" : ""}`}
          >
            {role === "ROLE_USER"
              ? "User"
              : role === "ROLE_SELLER"
              ? "Seller"
              : "Admin"}
          </button>
        ))}
      </div>

    
      <form onSubmit={handleSubmit} className="login-form">
        <h3 className="role-title">
          {selectedRole === "ROLE_USER"
            ? "User Login"
            : selectedRole === "ROLE_SELLER"
            ? "Seller Login"
            : "Admin Login"}
        </h3>

        <div className="input-group">
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="form-input"
          />
          <p className="error-text">{errors.email || " "}</p>
        </div>

    
        <div className="input-group">
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="form-input"
          />
          <p className="error-text">{errors.password || " "}</p>
        </div>

  
        {errors.api && <p className="error-text">{errors.api}</p>}

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
