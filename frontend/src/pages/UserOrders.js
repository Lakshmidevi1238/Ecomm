import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "../styles/user-orders.css";

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const steps = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/orders");
      const sortedOrders = (res.data || []).sort((a, b) => b.orderId - a.orderId);
      setOrders(sortedOrders);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const getStatusIndex = (status) => {
    const idx = steps.indexOf((status || "").toUpperCase());
    return idx === -1 ? 0 : idx;
  };

  const getPaymentBadge = (paymentMethod, itemStatus) => {
    if (paymentMethod?.toUpperCase() === "CARD") {
      return { label: "PAID", className: "paid" };
    }
    if (paymentMethod?.toUpperCase() === "COD") {
      return itemStatus?.toUpperCase() === "DELIVERED"
        ? { label: "PAID", className: "paid" }
        : { label: "PENDING", className: "pending" };
    }
    return { label: "UNKNOWN", className: "unknown" };
  };

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      <div className="orders-header">
        <button onClick={() => navigate("/user/home")} className="back-btn">
          Back to Home
        </button>
        <button onClick={fetchOrders} className="refresh-btn">
          Refresh Orders
        </button>
        {lastUpdated && (
          <p className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className="order-card">
            <div className="order-header">
              <strong>Order #{order.orderId}</strong>
             
              {order.paymentMethod?.toUpperCase() === "COD" &&
              order.items.every((i) => i.status === "DELIVERED") ? (
                <span className="payment-badge paid">PAID</span>
              ) : order.paymentMethod?.toUpperCase() === "CARD" ? (
                <span className="payment-badge paid">PAID</span>
              ) : (
                <span className="payment-badge pending">PENDING</span>
              )}
            </div>

            <div className="order-info">
              <p>
                <b>Date:</b>{" "}
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p>
                <b>Total:</b> ₹{order.total}
              </p>
              <p>
                <b>Payment Method:</b>{" "}
                <span className="payment-method">
                  {order.paymentMethod
                    ? order.paymentMethod === "CARD"
                      ? "CARD"
                      : order.paymentMethod.toUpperCase()
                    : "Not specified"}
                </span>
              </p>
            </div>

            <div className="order-status-section">
              <h4>Order Status</h4>
              <ul>
                {order.items.map((item) => {
                  const currentIndex = getStatusIndex(item.status);
                  const payment = getPaymentBadge(order.paymentMethod, item.status);

                  return (
                    <li key={item.productId} className="status-item">
                      <div className="status-line">
                        <div className="status-left">
                          <b>{item.productName}</b>
                          <span
                            className={`item-status ${item.status?.toLowerCase()}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="status-right">
                          <span className={`payment-badge ${payment.className}`}>
                            {payment.label}
                          </span>
                        </div>
                      </div>

                      <small>
                        Quantity: {item.quantity} — ₹{item.lineTotal}
                      </small>

                      <div className="progress-container">
                        {steps.map((step, index) => (
                          <div key={step} className="progress-step">
                            <div
                              className={`circle ${
                                index <= currentIndex ? "active" : ""
                              } ${
                                item.status?.toLowerCase() === "delivered" &&
                                index === 3
                                  ? "delivered"
                                  : ""
                              }`}
                            >
                              {index + 1}
                            </div>
                            <p className="step-label">{step}</p>
                            {index < steps.length - 1 && (
                              <div
                                className={`line ${
                                  index < currentIndex ? "active" : ""
                                }`}
                              ></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="shipping-info">
              <h4>Shipping Details:</h4>
              <p>
                {order.shipping.name}
                <br />
                {order.shipping.line1}
                {order.shipping.line2 && <>, {order.shipping.line2}</>}
                <br />
                {order.shipping.city}
                {order.shipping.state && <>, {order.shipping.state}</>}
                <br />
                {order.shipping.postalCode}, {order.shipping.country}
                <br />
                {order.shipping.phone}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UserOrders;


