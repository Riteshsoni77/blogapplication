import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./MyBlogs.css";

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyBlogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/blogs/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(res.data);
      } catch (err) {
        console.error("Error fetching user blogs:", err);
      }
    };

    fetchMyBlogs();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(blogs.filter((blog) => blog.id !== id));
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  };

  return (
    <div className="myblogs-container">
      <div className="header">
        <h2>My Blogs</h2>
        <button className="create-button" onClick={() => navigate("/create")}>
          + Create Blog
        </button>
      </div>

      {blogs.length === 0 ? (
        <p className="no-blogs">You have not posted any blogs yet.</p>
      ) : (
        blogs.map((blog) => (
          <div className="blog-card" key={blog.id}>
            <h3>{blog.title}</h3>
            <p>{blog.content}</p>
            <div className="blog-actions">
              <Link to={`/edit/${blog.id}`}>Edit</Link>
              <button onClick={() => handleDelete(blog.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBlogs;
