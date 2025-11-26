import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/register.css"; 

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email)) newErrors.email = "Invalid email format.";

    if (!form.password.trim()) newErrors.password = "Password is required.";
    else if (!passwordRegex.test(form.password))
      newErrors.password =
        "Must have 8+ chars, 1 uppercase, 1 lowercase, 1 number.";

    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!phoneRegex.test(form.phone))
      newErrors.phone = "Phone number must be exactly 10 digits.";

    if (!form.address.trim()) newErrors.address = "Address is required.";
    if (!form.role) newErrors.role = "Select a role.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;

    try {
      await axios.post("http://localhost:8080/api/v1/auth/register", form);
      setMessage("Registered successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(
        "Registration failed! " + (err.response?.data?.message || "")
      );
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>

      <form onSubmit={handleSubmit} className="register-form">
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="form-input"
        />
        {errors.name && <p className="error-text">{errors.name}</p>}

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="form-input"
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="form-input"
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <input
          name="phone"
          placeholder="Phone Number"
          maxLength="10"
          onChange={handleChange}
          className="form-input"
        />
        {errors.phone && <p className="error-text">{errors.phone}</p>}

        <input
          name="address"
          placeholder="Address"
          onChange={handleChange}
          className="form-input"
        />
        {errors.address && <p className="error-text">{errors.address}</p>}

        <select name="role" onChange={handleChange} className="form-select">
          <option value="">Select Role</option>
          <option value="ROLE_USER">User</option>
          <option value="ROLE_SELLER">Seller</option>
          
        </select>
        {errors.role && <p className="error-text">{errors.role}</p>}

        <button type="submit" className="register-btn">
          Register
        </button>
      </form>

      {message && (
        <p
          className={`feedback-msg ${
            message.includes("success") ? "success" : "error"
          }`}
        >
          {message}
        </p>
      )}

      <hr className="divider" />
      <p>Already have an account?</p>
      <button onClick={() => navigate("/login")} className="login-link-btn">
        Go to Login
      </button>
    </div>
  );
}

export default RegisterPage;
