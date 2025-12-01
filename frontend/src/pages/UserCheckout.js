import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "../styles/user-checkout.css";

function UserCheckout() {
  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchCart();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/users/me");
      const u = res.data;
      setUser(u);
      setShipping((s) => ({
        ...s,
        name: u.name || "",
        line1: u.address || "",
        // optional fields left blank if not present
        city: u.city || "",
        state: u.state || "",
        postalCode: u.postalCode || "",
        country: u.country || "",
        phone: u.phone || "",
      }));
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get("/cart");
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const validateShipping = () => {
    const { name, line1, city, state, postalCode, phone, country } = shipping;
    if (!name) return "Please enter your full name.";
    if (!line1) return "Please enter your address line 1.";
    if (!city) return "Please enter your city.";
    if (!state) return "Please enter your state.";
    if (!postalCode) return "Please enter your postal code.";
    if (!country) return "Please enter your country.";
    if (!phone) return "Please enter your phone number.";
    if (!/^\d{6}$/.test(postalCode)) return "Please enter a valid 6-digit postal code.";
    if (!/^\d{10}$/.test(phone)) return "Please enter a valid 10-digit phone number.";
    return null;
  };

  const validateCard = () => {
    const { cardNumber, cardName, expiry, cvv } = cardDetails;
    if (!cardName) return "Please enter the cardholder's name.";
    if (!/^\d{16}$/.test(cardNumber)) return "Please enter a valid 16-digit card number.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return "Please enter a valid expiry date (MM/YY).";
    if (!/^\d{3}$/.test(cvv)) return "Please enter a valid 3-digit CVV.";
    return null;
  };

  const handleConfirmOrder = async () => {
    const shipErr = validateShipping();
    if (shipErr) return alert(shipErr);

    if (paymentMethod === "CARD") {
      const cardErr = validateCard();
      if (cardErr) return alert(cardErr);
    }

    try {
      const orderRequest = {
        shipping,
        paymentMethod,
        cardDetails: paymentMethod === "CARD" ? cardDetails : null,
        notes: "Deliver as soon as possible",
      };

      await axiosInstance.post("/orders/checkout", orderRequest);
      alert("Order placed successfully!");
      navigate("/user/orders");
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed: " + (err.response?.data?.message || "Try again"));
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + (i.lineTotal || 0), 0);

  return (
    <div className="checkout-container">
      <h2>Order Confirmation</h2>

      <div className="checkout-grid">
        {/* LEFT: Shipping + Payment */}
        <div>
          <section className="checkout-section">
            <h3>Shipping Details</h3>
            <div className="shipping-form">
              <input
                type="text"
                value={shipping.name}
                onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                placeholder="Full Name"
              />
              <input
                type="text"
                value={shipping.line1}
                onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
                placeholder="Address Line 1"
              />
              <input
                type="text"
                value={shipping.line2}
                onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
                placeholder="Address Line 2 (optional)"
              />
              <input
                type="text"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                placeholder="City"
              />
              <input
                type="text"
                value={shipping.state}
                onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                placeholder="State"
              />
              <input
                type="text"
                value={shipping.postalCode}
                onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                placeholder="Postal Code"
              />
              <input
                type="text"
                value={shipping.country}
                onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                placeholder="Country"
              />
              <input
                type="text"
                value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                placeholder="Phone Number"
              />
            </div>
          </section>

          <section className="checkout-section">
            <h3>Payment Method</h3>
            <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center" }}>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="COD">Cash on Delivery</option>
                <option value="CARD">Credit / Debit Card</option>
              </select>
            </div>

            {paymentMethod === "CARD" && (
              <div className="card-form">
                <h4>Card Details</h4>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardDetails.cardName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Card Number (16 digits)"
                  value={cardDetails.cardNumber}
                  maxLength={16}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value.replace(/\D/g, "") })}
                />
                <div className="card-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    maxLength={5}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    maxLength={3}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: Order summary (sticky) */}
        <aside className="right-column">
          <div className="order-summary-card checkout-section">
            <h3>Order Summary</h3>
            <ul className="order-summary">
              {cart.map((item) => (
                <li key={item.cartItemId}>
                  <div className="item-name">{item.productName}</div>
                  <div>₹{item.lineTotal}</div>
                </li>
              ))}
            </ul>

            <div className="total">Total: ₹{subtotal}</div>
          </div>
        </aside>
      </div>

      <div className="checkout-actions" style={{ marginTop: 18 }}>
        <button className="back-btn" onClick={() => navigate("/user/cart")}>Back to Cart</button>
        <button className="confirm-btn" onClick={handleConfirmOrder}>Confirm & Place Order</button>
      </div>
    </div>
  );
}

export default UserCheckout;
