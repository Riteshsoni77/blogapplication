import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./EditBlog.css"; // 👈 Add this

function EditBlog() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get("http://localhost:3000/blogs/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const blogToEdit = res.data.find((blog) => blog.id === parseInt(id));
        if (blogToEdit) {
          setTitle(blogToEdit.title);
          setContent(blogToEdit.content);
        } else {
          navigate("/myblogs");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [id, token, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3000/blogs/${id}`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/myblogs");
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-box">
        <h2>Edit Blog</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit">Update Blog</button>
        </form>
      </div>
    </div>
  );
}

export default EditBlog;
