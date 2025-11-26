import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
import SearchBar from "../components/SearchBar";
import "../styles/search.css";
import banner1 from "../assets/banner1.jpg"
import banner2 from "../assets/banner2.jpg"
import banner3 from "../assets/banner3.jpg"
import electronics from "../assets/electronics.png";
import fashion from "../assets/fashion.png";
import homedecor from "../assets/homedecor.png"
import healthandbeauty from "../assets/healthandbeauty.png"
import groceries from "../assets/groceries.png"
import sports from "../assets/sports.png"
import luxury from "../assets/luxury.png"




function LandingPage() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      img: banner1,
      title: "iPhone 16 Pro Max",
      text: "From ₹1,29,999 — Fast, Smart, Stunning.",
     
    },
    {
      img: banner2,
      title: "Exclusive Shoe Sale",
      text: "Up to 50% off on premium sneakers!",
      
    },
    {
      img: banner3,
      title: "Fresh Groceries Daily",
      text: "Delivered to your doorstep, fresh and quick.",
     
    },
  ];

  const categories = [
    { name: "Electronics", img: electronics },
    { name: "Fashion", img: fashion },
    { name: "Luxury", img: luxury },
    { name: "Home Decor", img: homedecor },
    { name: "Health & Beauty", img: healthandbeauty },
    { name: "Groceries", img: groceries },
    { name: "Sports", img: sports },
  ];

  
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="landing-page">
      
      
<nav className="navbar">
  <div className="nav-left">
    <h1 className="logo">QuitQ</h1>
    <SearchBar placeholder="Search for any product or brand" />
  </div>
  <div className="nav-right">
    <button className="nav-btn" onClick={() => navigate("/register")}>
      Sign In
    </button>
  </div>
</nav>

      
      <section className="hero">
        <div className="slideshow">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`slide ${i === slideIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.img})` }}
            >
              <div className="overlay">
                <h2>{slide.title}</h2>
                <p>{slide.text}</p>
                
              </div>
            </div>
          ))}
        </div>
        
      </section>

      
      <section className="categories">
        <h2>Explore Popular Categories</h2>
        <div className="category-list">
          {categories.map((cat, i) => (
            <div key={i} className="category-card">
              <img src={cat.img} alt={cat.name} />
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

     
      <footer className="footer">
        <p>© {new Date().getFullYear()} QuitQ — Built for Smarter Shopping.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
