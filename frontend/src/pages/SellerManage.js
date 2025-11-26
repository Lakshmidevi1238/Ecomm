import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/seller-common.css";
import "../styles/SellerManage.css";

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

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
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

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      stock: product.stock,
      brand: product.brand,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8080/api/v1/seller/products/${editingId}`,
        {
          ...editForm,
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product updated successfully!");
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/seller/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product!");
    }
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
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button className="btn btn-success" onClick={handleUpdate}>
                      Save
                    </button>
                    <button
                      className="btn btn-gray"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>{p.brand}</td>
                  <td>{p.description}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditClick(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(p.id)}
                    >
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
