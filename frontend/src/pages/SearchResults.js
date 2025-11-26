
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "../styles/search-results.css";

function SearchResults() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("query") || "";

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/products");
        const all = res.data || [];
        const filtered = all.filter((p) =>
          (p.name || "").toLowerCase().includes(query.toLowerCase())
        );
        setProducts(filtered);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  const handleClick = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be signed in to view this product.");
      navigate("/login");
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div className="search-results-page">
      <h2>Search Results for “{query}”</h2>

      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && (
        <p>No products found for your search.</p>
      )}

      <div className="results-grid">
        {products.map((p) => (
          <div
            key={p.id}
            className="product-card"
            onClick={() => handleClick(p)}
          >
            <img
              src={p.imageUrl} alt={p.name}/>
             
            <div className="product-info">
              <p className="product-name">{p.name}</p>
              <p className="product-price">₹{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;
