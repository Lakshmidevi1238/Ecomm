import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "../styles/user-orders.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`;
}

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
      const data = Array.isArray(res.data) ? res.data : [];
      const sortedOrders = data.sort((a, b) => (b.orderId ?? 0) - (a.orderId ?? 0));
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
    if (!paymentMethod) return { label: "UNKNOWN", className: "unknown" };
    if (paymentMethod.toUpperCase() === "CARD") return { label: "PAID", className: "paid" };
    if (paymentMethod.toUpperCase() === "COD") {
      return itemStatus?.toUpperCase() === "DELIVERED"
        ? { label: "PAID", className: "paid" }
        : { label: "PENDING", className: "pending" };
    }
    return { label: "UNKNOWN", className: "unknown" };
  };

  // helper to compute progress % (0..100) based on step index
  const calcProgressPercent = (index) => {
    if (index <= 0) return 0;
    const totalSteps = steps.length - 1;
    return Math.round((index / totalSteps) * 100);
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
          <p className="last-updated">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        )}
      </div>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => {
          const orderItems = Array.isArray(order.items) ? order.items : [];
          const total = order.total ?? orderItems.reduce((s, it) => s + (it.lineTotal ?? 0), 0);
          return (
            <div key={order.orderId ?? Math.random()} className="order-card">
              <div className="order-header">
                <strong>Order #{order.orderId ?? "—"}</strong>

                <span
                  className={`payment-badge ${
                    (order.paymentMethod ?? "").toUpperCase() === "CARD"
                      ? "paid"
                      : orderItems.every((i) => i.status === "DELIVERED")
                      ? "paid"
                      : "pending"
                  }`}
                >
                  {(order.paymentMethod ?? "COD").toUpperCase() === "CARD" ? "PAID" : orderItems.every((i) => i.status === "DELIVERED") ? "PAID" : "PENDING"}
                </span>
              </div>

              <div className="order-info">
                <p>
                  <b>Date:</b>{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                    : "—"}
                </p>
                <p>
                  <b>Total:</b> ₹{total}
                </p>
                <p>
                  <b>Payment Method:</b>{" "}
                  <span style={{ color: "#374151", fontWeight: 600 }}>
                    {order.paymentMethod ? order.paymentMethod.toUpperCase() : "COD"}
                  </span>
                </p>
              </div>

              <div className="order-status-section">
                <h4>Order Status</h4>
                <ul style={{ padding: 0, margin: 0 }}>
                  {orderItems.map((item, idx) => {
                    const currentIndex = getStatusIndex(item.status);
                    const payment = getPaymentBadge(order.paymentMethod, item.status);
                    const imageSrc = getImageUrl(
                      item.imageUrl || item.productImage || item.productImageUrl || item.product?.imageUrl
                    );

                    // compute progress percent for this item and inject via style
                    const progressPercent = calcProgressPercent(currentIndex);

                    return (
                      <li key={item.orderItemId ?? `${item.productId}-${idx}`} className="status-item">
                        <div className="status-line" style={{ alignItems: "center" }}>
                          {imageSrc && (
                            <img
                              src={imageSrc}
                              alt={item.productName}
                              style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 6 }}
                            />
                          )}
                          <div className="status-left">
                            <b>{item.productName}</b>
                            <span className={`item-status ${item.status?.toLowerCase() || "placed"}`} style={{ marginLeft: 10 }}>
                              {item.status ?? "PLACED"}
                            </span>
                          </div>

                          <div style={{ marginLeft: "auto" }}>
                            <span className={`payment-badge ${payment.className}`}>{payment.label}</span>
                          </div>
                        </div>

                        <small style={{ display: "block", marginBottom: 8 }}>
                          Quantity: {item.quantity ?? 1} — ₹{item.lineTotal ?? 0}
                        </small>

                        <div
                          className="progress-container"
                          style={{
                            // set the active width of ::after using inline style by setting CSS variable:
                            // We'll set a CSS variable that the pseudo-element can read via var(--progress)
                          }}
                        >
                          {/* we cannot style ::after from inline easily; instead set a inline style on the container's pseudo width via a child element */}
                          <div
                            style={{
                              position: "absolute",
                              left: "6%",
                              top: 22,
                              height: 4,
                              background: "linear-gradient(90deg,#c88a55,#eec557)",
                              borderRadius: 4,
                              zIndex: 2,
                              width: `${progressPercent}%`,
                              transition: "width 0.32s ease",
                            }}
                          />
                          {steps.map((step, sidx) => (
                            <div key={step} className="progress-step">
                              <div className={`circle ${sidx <= currentIndex ? "active" : ""}`}>{sidx + 1}</div>
                              <div className="step-label">{step}</div>
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
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  {order.shipping?.name ?? ""}
                  <br />
                  {order.shipping?.line1 ?? ""}
                  {order.shipping?.line2 ? `, ${order.shipping.line2}` : ""}
                  <br />
                  {order.shipping?.city ?? ""}{order.shipping?.state ? `, ${order.shipping.state}` : ""}
                  <br />
                  {order.shipping?.postalCode ? `${order.shipping.postalCode}, ` : ""}{order.shipping?.country ?? ""}
                  <br />
                  {order.shipping?.phone ?? ""}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default UserOrders;
