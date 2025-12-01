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

  const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="user-cart-container">

      <h2>Your Cart</h2>

      <button onClick={() => navigate("/user/home")} className="back-btn">
        Back to Home
      </button>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div className="cart-list">
            {cart.map((item) => {
              const img = getImageUrl(
                item.imageUrl ||
                  item.productImage ||
                  item.product?.imageUrl
              );

              return (
                <div key={item.cartItemId} className="cart-item fade-slide">
                  <div className="cart-item-left">
                    {img && (
                      <img
                        src={img}
                        alt={item.productName}
                        className="cart-item-img"
                      />
                    )}
                    <div>
                      <div className="cart-item-name">{item.productName}</div>
                      <div className="cart-item-price">
                        ₹{item.unitPrice} × {item.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <button
                      className="qty-circle"
                      onClick={() =>
                        updateCartItem(item.cartItemId, item.quantity + 1)
                      }
                    >
                      +
                    </button>

                    <span className="qty-number">{item.quantity}</span>

                    <button
                      className="qty-circle"
                      onClick={() =>
                        item.quantity > 1
                          ? updateCartItem(item.cartItemId, item.quantity - 1)
                          : deleteCartItem(item.cartItemId)
                      }
                    >
                      –
                    </button>

                    <button
                      className="remove-btn"
                      onClick={() => deleteCartItem(item.cartItemId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Checkout Summary */}
          <div className="floating-checkout-bar">
            <div>
              <strong>{totalItems} items</strong> | Subtotal:{" "}
              <span className="subtotal-value">₹{subtotal}</span>
            </div>

            <div>
              <button
                onClick={handleCheckoutClick}
                className="checkout-btn"
              >
                Proceed to Checkout
              </button>

              <button onClick={clearCart} className="clear-btn">
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCart;
