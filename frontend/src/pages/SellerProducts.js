import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/seller-common.css";
import "../styles/SellerProducts.css";

const BASE_URL = process.env.REACT_APP_API_URL ?? "";

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
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProducts();
    fetchCategories();
  }, []);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/seller/products`, authHeaders());
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      if (err?.response?.status === 401) navigate("/login");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/categories`, authHeaders());
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      if (err?.response?.status === 401) navigate("/login");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock || "0", 10),
        categoryId: parseInt(form.categoryId, 10),
      };

      const res = await axios.post(`${BASE_URL}/api/v1/seller/products`, payload, authHeaders());
      const createdProduct = res.data;

      if (selectedFile && createdProduct?.id) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        await axios.post(
          `${BASE_URL}/api/v1/seller/products/${createdProduct.id}/image`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      alert("Product added successfully!");
      setForm({ name: "", price: "", description: "", stock: "", brand: "", categoryId: "" });
      setSelectedFile(null);
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/v1/seller/products/${id}`, authHeaders());
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete!");
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${BASE_URL}${imageUrl}`;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Manage Products</h2>

      <form onSubmit={handleAddProduct} className="product-form">
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
          placeholder="Stock"
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
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label className="file-label">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
        </label>

        <button type="submit" className="btn btn-success">Add Product</button>
      </form>

      <h3 className="sub-title">My Products</h3>

      <ul className="product-list">
        {products.map((p) => (
          <li key={p.id} className="product-item">
            <img
              src={getImageUrl(p.imageUrl)}
              alt={p.name}
              style={{ width: 120, height: 90, objectFit: "cover" }}
            />

            <div className="info">
              <strong>{p.name}</strong> — ₹{p.price}
              <div>Stock: {p.stock}</div>
              <div>Brand: {p.brand}</div>
            </div>

            <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SellerProducts;
