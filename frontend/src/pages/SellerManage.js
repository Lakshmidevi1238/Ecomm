// src/pages/SellerManage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/seller-common.css";
import "../styles/SellerManage.css";

const BASE_URL = process.env.REACT_APP_API_URL ?? "";

function SellerManage() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    brand: "",
  });
  const [fileMap, setFileMap] = useState({}); // productId -> File

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/seller/products`, authHeaders());
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err?.response?.status, err?.response?.data || err.message);
      if (err?.response?.status === 401) navigate("/login");
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name || "",
      price: product.price ?? "",
      description: product.description || "",
      stock: product.stock ?? "",
      brand: product.brand || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await axios.put(
        `${BASE_URL}/api/v1/seller/products/${editingId}`,
        {
          ...editForm,
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock, 10),
        },
        authHeaders()
      );
      alert("Product updated successfully!");
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err?.response?.status, err?.response?.data || err.message);
      alert("Failed to update product!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/v1/seller/products/${id}`, authHeaders());
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err?.response?.status, err?.response?.data || err.message);
      alert("Failed to delete product!");
    }
  };

  const handleUploadImage = async (productId) => {
    const file = fileMap[productId];
    if (!file) {
      alert("Please choose a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${BASE_URL}/api/v1/seller/products/${productId}/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Image uploaded!");
      setFileMap((m) => {
        const copy = { ...m };
        delete copy[productId];
        return copy;
      });
      fetchProducts();
    } catch (err) {
      console.error("Upload failed:", err?.response?.status, err?.response?.data || err.message);
      const serverMessage = err?.response?.data || err?.message || "Unknown error";
      alert("Image upload failed: " + JSON.stringify(serverMessage));
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${BASE_URL}${imageUrl}`;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Manage Your Products</h2>

      <button onClick={() => navigate("/seller/home")} className="btn btn-gray back-btn">
        Back to Home
      </button>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Brand</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) =>
              editingId === p.id ? (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.imageUrl ? (
                      <img
                        src={getImageUrl(p.imageUrl)}
                        alt="prod"
                        style={{ width: 80, height: 60, objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/images/placeholder.png"; }}
                      />
                    ) : (
                      <div style={{ width: 80, height: 60, background: "#eee" }} />
                    )}
                  </td>
                  <td>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </td>
                  <td>
                    <button className="btn btn-success" onClick={handleUpdate}>
                      Save
                    </button>
                    <button className="btn btn-gray" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.imageUrl ? (
                      <img
                        src={getImageUrl(p.imageUrl)}
                        alt={p.name}
                        style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/images/placeholder.png"; }}
                      />
                    ) : (
                      <div style={{ width: 80, height: 60, background: "#f0f0f0" }} />
                    )}
                    <div style={{ marginTop: 6 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFileMap((m) => ({ ...m, [p.id]: e.target.files?.[0] || null }))}
                      />
                      <button className="btn btn-primary" onClick={() => handleUploadImage(p.id)} style={{ marginTop: 4 }}>
                        Upload Image
                      </button>
                    </div>
                  </td>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>{p.brand}</td>
                  <td>{p.description}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleEditClick(p)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SellerManage;
