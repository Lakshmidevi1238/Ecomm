// src/components/SellerProducts.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/seller-common.css";
import "../styles/SellerProducts.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    brand: "",
    categoryId: "",
  });
  const [selectedFile, setSelectedFile] = useState(null); // NEW
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/seller/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/seller/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      alert("Please select a category!");
      return;
    }

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock || "0"),
        categoryId: parseInt(form.categoryId),
      };

      // 1) create product (JSON)
      const res = await axios.post(`${BASE_URL}/api/v1/seller/products`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdProduct = res.data;
      // 2) if file selected, upload image to /seller/products/{id}/image
      if (selectedFile && createdProduct && createdProduct.id) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
          await axios.post(
            `${BASE_URL}/api/v1/seller/products/${createdProduct.id}/image`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } catch (imgErr) {
          console.error("Image upload failed:", imgErr);
          // non-fatal — product created, image failed
          alert("Product created but image upload failed.");
        }
      }

      alert("Product added successfully!");
      // reset
      setForm({
        name: "",
        price: "",
        description: "",
        stock: "",
        brand: "",
        categoryId: "",
      });
      setSelectedFile(null);
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/v1/seller/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // helper to get full image URL (backend serves /uploads/**)
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${BASE_URL}${imageUrl}`;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Manage Products</h2>

      <form onSubmit={handleAddProduct} className="product-form" encType="multipart/form-data">
        <input
          type="text"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="text"
          placeholder="Brand"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Stock Quantity"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          required
        />

        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* NEW: file input */}
        <label className="file-label">
          Product Photo (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
        </label>

        <button type="submit" className="btn btn-success">
          Add Product
        </button>
      </form>

      <h3 className="sub-title">My Products</h3>
      <ul className="product-list">
        {products.map((p) => (
          <li key={p.id} className="product-item">
            <div style={{ display: "flex", gap: 12 }}>
              <div>
                {p.imageUrl ? (
                  <img
                    src={getImageUrl(p.imageUrl)}
                    alt={p.name}
                    style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  <div style={{ width: 120, height: 90, background: "#eee", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:6 }}>
                    No Image
                  </div>
                )}
              </div>
              <div>
                <strong>{p.name}</strong> — ₹{p.price}
                <br />
                <small>{p.description}</small>
                <div> Stock: {p.stock}</div>
                <div> Brand: {p.brand}</div>
                {p.category && (
                  <div className="product-category">
                    <em>Category: {p.category.name}</em>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate("/seller/home")} className="btn btn-gray back-btn">
        Back to Home
      </button>
    </div>
  );
}

export default SellerProducts;
