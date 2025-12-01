import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/seller-common.css"; // your existing common styles
import "../styles/SellerHome.css";   // new file below

function SellerHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    console.log("Token:", localStorage.getItem("token"));
  }, []);

  return (
    <div className="seller-page">
      <div className="hero-card">
        <div className="hero-top">
          <h1 className="hero-title">Welcome, Seller!</h1>
          <p className="hero-sub">
            Manage your products and orders — add new items, edit listings, and
            keep customers happy.
          </p>
        </div>

        <div className="actions-grid">
          <button
            className="action-btn action-add"
            onClick={() => navigate("/seller/products")}
            aria-label="Add new product"
          >
            
            <span className="label">Add New Product</span>
          </button>

          <button
            className="action-btn action-edit"
            onClick={() => navigate("/seller/manage")}
            aria-label="Edit or delete products"
          >
            
            <span className="label">Edit / Delete Products</span>
          </button>

          <button
            className="action-btn action-orders"
            onClick={() => navigate("/seller/orders")}
            aria-label="Manage orders"
          >
           
            <span className="label">Manage Orders</span>
          </button>

        
        </div>

        <div className="hero-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerHome;
