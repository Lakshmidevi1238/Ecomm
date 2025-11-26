import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/admin-products.css";

function AdminProducts() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8080/api/v1/admin/categories",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleUpdate = async (id) => {
    const updatedName = prompt("Enter new category name:");
    const updatedDesc = prompt("Enter new description:");
    if (!updatedName) return;

    try {
      await axios.put(
        `http://localhost:8080/api/v1/admin/categories/${id}`,
        { name: updatedName, description: updatedDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  return (
    <div className="admin-page">
      <h2>Manage Categories</h2>
      <button onClick={() => navigate("/admin/home")} className="back-btn">
        Back to Dashboard
      </button>

      <form onSubmit={handleAdd} className="admin-form">
        <input
          type="text"
          placeholder="Category Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit" className="btn">Add Category</button>
      </form>

      <ul className="admin-list">
        {categories.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> — {c.description || "No description"}
            <div>
              <button onClick={() => handleUpdate(c.id)}>Edit</button>
              <button onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminProducts;

