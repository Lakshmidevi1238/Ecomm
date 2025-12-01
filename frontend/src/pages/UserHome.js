import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "../styles/user-home.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`;
}

function UserHome() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null); // for modal
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axiosInstance.get("/products"),
        axiosInstance.get("/categories"),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axiosInstance.post("/cart/items", { productId, quantity: 1 });
      alert("Added to cart!");
    } catch (err) {
      alert("Failed to add to cart!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => {
          const productCategory =
            p.category?.name?.toLowerCase() ||
            p.categoryName?.toLowerCase() ||
            "";
          return productCategory === selectedCategory.toLowerCase();
        });

  return (
    <div className="user-home-container">
      <header className="user-header">
        <h2>Welcome, User!</h2>
        <div className="user-header-buttons">
          <button onClick={() => navigate("/user/cart")}>View Cart</button>
          <button onClick={() => navigate("/user/orders")}>My Orders</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="categories-section">
        <h3>Categories</h3>
        <div className="category-list">
          <span
            className={`category-item ${
              selectedCategory === "All" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </span>

          {categories.map((cat) => (
            <span
              key={cat.id}
              className={`category-item ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? "active"
                  : ""
              }`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </span>
          ))}
        </div>
      </section>

      <section className="products-section">
        <h3>
          {selectedCategory === "All"
            ? "Available Products"
            : `${selectedCategory} Products`}
        </h3>

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
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

                <p
                  className={`product-stock ${
                    p.stock > 0 ? "in-stock" : "out-stock"
                  }`}
                >
                  {p.stock > 0 ? `Stock: ${p.stock}` : "Out of stock"}
                </p>

                {p.brand && <p className="product-brand">{p.brand}</p>}
                {p.category && (
                  <p className="product-category">
                    {p.category.name || p.categoryName}
                  </p>
                )}

                <div className="product-actions">
                  <button
                    onClick={() => addToCart(p.id)}
                    disabled={p.stock <= 0}
                    className={p.stock <= 0 ? "btn-disabled" : "btn-primary"}
                  >
                    {p.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedProduct(p)}
                  >
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
  <div
    className="modal-overlay"
    onClick={() => setSelectedProduct(null)}
    role="dialog"
    aria-modal="true"
  >
    <div
      className="modal-content product-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="modal-close-x"
        onClick={() => setSelectedProduct(null)}
        aria-label="Close"
      >
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
            <strong>Category:</strong>{" "}
            {selectedProduct.category?.name || selectedProduct.categoryName}
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

            <button
              className="btn-secondary"
              onClick={() => setSelectedProduct(null)}
            >
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

export default UserHome;
