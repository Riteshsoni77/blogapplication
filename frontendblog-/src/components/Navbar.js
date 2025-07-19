import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
 // ✅ Add this line

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">BlogApp</Link>
      </div>
      <div className="navbar-links">
        {token ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/myblogs">My Blogs</Link>
            <Link to="/create">Create</Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
