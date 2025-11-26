import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/admin-users.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data); 
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

     
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, active: 0 } : u
        )
      );
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <div className="admin-page">
      <h2>Manage Users</h2>
      <button onClick={() => navigate("/admin/home")} className="back-btn">
        Back to Dashboard
      </button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            
              <td>
                {String(u.active) === "0" || u.active === false ? (
                  <button className="btn-deleted" disabled>
                    Deleted
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
