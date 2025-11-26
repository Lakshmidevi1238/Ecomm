import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "../styles/user-cart.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`;
}

function UserCart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get("/cart");
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const updateCartItem = async (id, quantity) => {
    try {
      await axiosInstance.put(`/cart/items/${id}`, { quantity });
      fetchCart();
    } catch (err) {
      console.error("Error updating cart item:", err);
    }
  };

  const deleteCartItem = async (id) => {
    try {
      await axiosInstance.delete(`/cart/items/${id}`);
      fetchCart();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const clearCart = async () => {
    try {
      await axiosInstance.delete("/cart");
      fetchCart();
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const handleCheckoutClick = () => {
    navigate("/user/checkout");
  };

  return (
    <div className="user-cart-container">
      <h2>Your Cart</h2>
      <button onClick={() => navigate("/user/home")} className="back-btn">
        Back to Home
      </button>

      {cart.length === 0 ? (
        <p>Cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => {
            const img = getImageUrl(item.imageUrl || item.productImage || item.product?.imageUrl);
            return (
              <div key={item.cartItemId} className="cart-item">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {img && <img src={img} alt={item.productName} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />}
                  <span>
                    <b>{item.productName}</b> — ₹{item.unitPrice} × {item.quantity}
                  </span>
                </div>
                <div>
                  <button onClick={() => updateCartItem(item.cartItemId, item.quantity + 1)}>add</button>
                  <button
                    onClick={() =>
                      item.quantity > 1
                        ? updateCartItem(item.cartItemId, item.quantity - 1)
                        : deleteCartItem(item.cartItemId)
                    }
                  >
                    minus
                  </button>
                  <button onClick={() => deleteCartItem(item.cartItemId)}>Remove</button>
                </div>
              </div>
            );
          })}
          <div className="cart-summary">
            <p>
              Total Items: {cart.reduce((s, i) => s + i.quantity, 0)} | Subtotal: ₹
              {cart.reduce((s, i) => s + i.lineTotal, 0)}
            </p>
            <button onClick={handleCheckoutClick} className="checkout-btn">
              Proceed to Checkout
            </button>
            <button onClick={clearCart} className="clear-btn">
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCart;
