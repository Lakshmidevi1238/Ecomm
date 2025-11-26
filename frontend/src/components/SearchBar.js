import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import "../styles/search.css";
import { useNavigate } from "react-router-dom";

function SearchBar({ placeholder = "Search for any product or brand" }) {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/products");
        if (!cancelled) setAllProducts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load products:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter((p) => {
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const categoryName =
          (p.category?.name || p.categoryName || "").toLowerCase();
        return (
          name.includes(q) || brand.includes(q) || categoryName.includes(q)
        );
      })
      .slice(0, 10);
  }, [query, allProducts]);

  const handleSelect = (productName) => {
    navigate(`/search-results?query=${encodeURIComponent(productName)}`);
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => query && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />

      {showDropdown && (
        <div className="search-dropdown">
          {loading && <div className="search-item">Loading…</div>}

          {!loading && query && results.length === 0 && (
            <div className="search-dropdown empty">
              <p>No products found</p>
            </div>
          )}

          {!loading &&
            results.map((p) => (
              <div
                key={p.id}
                className="search-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(p.name)}
              >
                <img
                  src={p.imageUrl || "/assets/default-product.jpg"}
                  alt={p.name}
                />
                <div>
                  <p className="product-name">{p.name}</p>
                  <p className="product-price">
                    {p.brand ? `${p.brand} · ` : ""}₹{p.price}
                  </p>
                </div>
              </div>
            ))}

       
          {!loading && results.length > 0 && (
            <div
              className="search-item see-all"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                navigate(`/search-results?query=${encodeURIComponent(query)}`)
              }
            >
              See all results
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
