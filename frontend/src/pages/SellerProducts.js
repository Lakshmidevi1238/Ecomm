import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/seller-common.css";
import "../styles/SellerProducts.css";

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

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/seller/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/seller/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
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
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
      };

      await axios.post("http://localhost:8080/api/v1/seller/products", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product added successfully!");
      setForm({
        name: "",
        price: "",
        description: "",
        stock: "",
        brand: "",
        categoryId: "",
      });
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/seller/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
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

        <button type="submit" className="btn btn-success">
          Add Product
        </button>
      </form>

      <h3 className="sub-title">My Products</h3>
      <ul className="product-list">
        {products.map((p) => (
          <li key={p.id} className="product-item">
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
            <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
              Delete
            </button>
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
