import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import BlogList from "./components/BlogList";
import MyBlogs from "./components/MyBlogs";
import Login from "./components/Login";
import Register from "./components/Register";
import CreateBlog from "./components/CreateBlog";
import EditBlog from "./components/EditBlog";
import Navbar from "./components/Navbar";

// ✅ Add these imports:
import ForgotPassword from "./components/ForgotPassword";
//import VerifyOTP from "./components/VerifyOTP";
//import ResetPassword from "./components/ResetPassword";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/myblogs"
          element={token ? <MyBlogs /> : <Navigate to="/login" />}
        />
        <Route
          path="/create"
          element={token ? <CreateBlog /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit/:id"
          element={token ? <EditBlog /> : <Navigate to="/login" />}
        />

        {/* 🔐 Password Recovery Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
      
       
      </Routes>
    </Router>
  );
}

export default App;
