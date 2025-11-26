import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/seller-common.css";
import "../styles/SellerHome.css";

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
    <div className="page-container">
      <h2 className="page-title">Welcome, Seller!</h2>
      <p className="page-subtitle">
        Manage your products, edit or delete, and handle customer orders.
      </p>

      <ul className="menu">
        <li>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/seller/products")}
          >
            Add New Product
          </button>
        </li>

        <li>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/seller/manage")}
          >
            Edit/Delete Products
          </button>
        </li>

        <li>
          <button
            className="btn btn-success"
            onClick={() => navigate("/seller/orders")}
          >
            Manage Orders
          </button>
        </li>

        <li>
          <button className="btn btn-danger logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default SellerHome;
