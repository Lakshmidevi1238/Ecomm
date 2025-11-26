import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin-home.css"; 

function AdminHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-home">
      <h2>Welcome Admin!</h2>

     
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

 
      <div className="admin-btn-container">
        <button
          className="admin-btn"
          onClick={() => navigate("/admin/products")}
        >
          Manage All Products
        </button>

        <button
          className="admin-btn"
          onClick={() => navigate("/admin/users")}
        >
          Manage Users
        </button>
      </div>
    </div>
  );
}

export default AdminHome;
