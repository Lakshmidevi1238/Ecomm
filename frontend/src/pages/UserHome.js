// src/components/UserHome.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "../styles/user-home.css";

const BASE_URL = process.env.REACT_APP_API_URL ?? "";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "/images/placeholder.png";
  if (imageUrl.startsWith("http")) return imageUrl;
  // imageUrl often like "/uploads/xxx.jpg" — prefix BASE_URL (may be empty)
  return `${BASE_URL}${imageUrl}`;
}

export default function UserHome() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axiosInstance.get("/products"),
        axiosInstance.get("/categories"),
      ]);

      console.debug("prodRes raw:", prodRes);
      console.debug("catRes raw:", catRes);

      const prodData = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.content ?? prodRes.data ?? [];
      const catData = Array.isArray(catRes.data) ? catRes.data : catRes.data?.content ?? catRes.data ?? [];

      setProducts(prodData || []);
      setCategories(catData || []);
    } catch (err) {
      console.error("Error loading:", err);
    }
  };

  const addToCart = async (id) => {
    try {
      await axiosInstance.post("/cart/items", { productId: id, quantity: 1 });
      alert("Added to cart!");
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add!");
    }
  };

  const filtered =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) =>
            (p.category?.name || p.categoryName || "").toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div className="user-home-container">
      <header className="user-header">
        <h2>Welcome, User!</h2>
        <div className="user-header-buttons">
          <button onClick={() => navigate("/user/cart")}>View Cart</button>
          <button onClick={() => navigate("/user/orders")}>My Orders</button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="categories-section">
        <h3>Categories</h3>
        <div className="category-list">
          <span
            className={`category-item ${selectedCategory === "All" ? "active" : ""}`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </span>

          {categories.map((c) => (
            <span
              key={c.id}
              className={`category-item ${
                selectedCategory.toLowerCase() === (c.name || "").toLowerCase() ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(c.name)}
            >
              {c.name}
            </span>
          ))}
        </div>
      </section>

      <section className="products-section">
        <h3>{selectedCategory === "All" ? "Available Products" : `${selectedCategory} Products`}</h3>

        <div className="product-grid">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-image-wrapper">
                  {p.imageUrl ? (
                    <img
                      src={getImageUrl(p.imageUrl)}
                      alt={p.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                  ) : (
                    <div className="no-image">No image</div>
                  )}
                </div>

                <h4>{p.name}</h4>
                <p className="product-price">₹{p.price}</p>
                <p className={`product-stock ${p.stock > 0 ? "in-stock" : "out-stock"}`}>
                  {p.stock > 0 ? `Stock: ${p.stock}` : "Out of stock"}
                </p>

                <div className="product-actions">
                  <button
                    onClick={() => addToCart(p.id)}
                    disabled={p.stock <= 0}
                    className={p.stock <= 0 ? "btn-disabled" : "btn-primary"}
                  >
                    {p.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>

                  <button className="btn-secondary" onClick={() => setSelectedProduct(p)}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No products found for this category.</p>
          )}
        </div>
      </section>

      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedProduct(null)}>
              ×
            </button>

            <div className="modal-top product-modal-grid">
              <div className="modal-image">
                {selectedProduct.imageUrl ? (
                  <img
                    src={getImageUrl(selectedProduct.imageUrl)}
                    alt={selectedProduct.name}
                    className="product-modal-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/placeholder.png";
                    }}
                  />
                ) : (
                  <div className="no-image-large">No image</div>
                )}
              </div>

              <div className="modal-info">
                <h3 className="modal-title">{selectedProduct.name}</h3>
                <p className="modal-price">₹{selectedProduct.price}</p>
                <p className="modal-meta">
                  <strong>Brand:</strong> {selectedProduct.brand || "N/A"}
                </p>
                <p className="modal-meta">
                  <strong>Category:</strong> {selectedProduct.category?.name || selectedProduct.categoryName}
                </p>
                <p className={`modal-stock ${selectedProduct.stock > 0 ? "in-stock" : "out-stock"}`}>
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : "Out of stock"}
                </p>

                <div className="modal-actions">
                  <button
                    onClick={() => addToCart(selectedProduct.id)}
                    className={selectedProduct.stock <= 0 ? "btn-disabled" : "btn-primary"}
                    disabled={selectedProduct.stock <= 0}
                  >
                    {selectedProduct.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>

                  <button className="btn-secondary" onClick={() => setSelectedProduct(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-description">
              <h4>Description</h4>
              <p>{selectedProduct.description || "No description available."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
