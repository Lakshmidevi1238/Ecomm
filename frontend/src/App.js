import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserHome from "./pages/UserHome";
import UserCart from "./pages/UserCart";
import UserOrders from "./pages/UserOrders";
import SellerHome from "./pages/SellerHome";
import SellerProducts from "./pages/SellerProducts";
import SellerOrders from "./pages/SellerOrders";
import AdminHome from "./pages/AdminHome";
import ProtectedRoute from "./pages/ProtectedRoute";
import UserCheckout from "./pages/UserCheckout";
import LandingPage from "./pages/LandingPage";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import SearchResults from "./pages/SearchResults";
import SellerManage from "./pages/SellerManage"; 

function App() {
  return (
    <Router>
      <Routes>

      <Route path="/" element={<LandingPage />} />
       <Route path="/search-results" element={<SearchResults />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/user/home"
          element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
              <UserHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/cart"
          element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
              <UserCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/orders"
          element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
              <UserOrders />
            </ProtectedRoute>
          }
        />
        <Route
  path="/user/checkout"
  element={
    <ProtectedRoute allowedRoles={["ROLE_USER"]}>
      <UserCheckout />
    </ProtectedRoute>
  }
/>

       
        <Route
          path="/seller/home"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SELLER"]}>
              <SellerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SELLER"]}>
              <SellerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SELLER"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/manage"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SELLER"]}>
              <SellerManage />
            </ProtectedRoute>
          }
        />

    
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
  path="/admin/products"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <AdminProducts />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <AdminUsers />
    </ProtectedRoute>
  }
/>

       
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
