import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SellerOrders.css";

function SellerOrders() {
  const [orderItems, setOrderItems] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const fetchSellerOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/seller/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderItems(res.data || []); 
    } catch (err) {
      console.error("Error fetching seller orders:", err);
    }
  };

  
  const updateOrderStatus = async (itemId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/api/v1/seller/orders/items/${itemId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Order #${itemId} updated to ${newStatus}`);
      fetchSellerOrders(); 
    } catch (err) {
      alert("Failed to update order status.");
      console.error(err);
    }
  };

  return (
    <div className="seller-orders-container">
      <h2>Customer Orders</h2>
      <button onClick={() => navigate("/seller/home")} className="back-btn">
        Back to Home
      </button>

      {orderItems.length === 0 ? (
        <p>No customer orders yet.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Item ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item) => (
              <tr key={item.itemId}>
                <td>{item.orderId}</td>
                <td>{item.itemId}</td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>₹{item.unitPrice}</td>
                <td>
                  <span className={`status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <select
                    onChange={(e) =>
                      updateOrderStatus(item.itemId, e.target.value)
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Update
                    </option>
                    <option value="PLACED">Placed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SellerOrders;
