import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import "./App.css";
import BlogDetails from './BlogDetails';

function App() {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', author: '', image: null });
  const [searchKeyword, setSearchKeyword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/blogs/search`, {
        params: { keyword: searchKeyword },
      });
      setBlogs(response.data); // Display search results
    } catch (error) {
      console.error('Error searching blogs:', error);
    }
  };


  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newBlog.title);
    formData.append('content', newBlog.content);
    formData.append('author', newBlog.author);
    formData.append('image', newBlog.image);

    try {
      const response = await axios.post('http://localhost:5000/blogs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setBlogs([...blogs, response.data]);
      setNewBlog({ title: '', content: '', author: '', image: null });
    } catch (error) {
      console.error('Error creating blog:', error);
    }
  };

  const handleDeleteBlog = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this blog?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/blogs/${id}`);
      setBlogs(blogs.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleBlogClick = (id) => {
    navigate(`/blogs/${id}`); // Navigate to the detailed blog page
  };

  return (
    <div className="blog-app">
      <div className="create-blog">
        <h1>My Blog</h1>
        <form onSubmit={handleCreateBlog}>
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="content">Content:</label>
            <textarea
              id="content"
              value={newBlog.content}
              onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="author">Author:</label>
            <input
              type="text"
              id="author"
              value={newBlog.author}
              onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="image">Upload Image:</label>
            <input
              type="file"
              id="image"
              onChange={(e) => setNewBlog({ ...newBlog, image: e.target.files[0] })}
            />
          </div>
          <button type="submit">Create Blog</button>
        </form>
      </div>

      <div className="display-blog">
        <div className="search-blog">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div>
          <h1>Blogs</h1>
          <ul>
            {blogs.map((blog) => (
              <li
                key={blog._id}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent bubbling
                  handleBlogClick(blog._id); // Navigate to detail page
                }}
                className="blog-item"
              >
                <h3>{blog.title}</h3>
                {blog.image && <img src={blog.image} alt={blog.title} style={{ width: '25%', borderRadius: '5px' }} />}
                <p>By {blog.author}</p>
                <p>{blog.content.substring(0, 100)}...</p>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteBlog(blog._id); }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function BlogDetail({ id }) {
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    fetchBlogDetail();
  }, []);

  const fetchBlogDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/blogs/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog details:', error);
    }
  };

  return (
    <div>
      {blog ? (
        <div>
          <h2>{blog.title}</h2>
          <p>{blog.content}</p>
          <p>By {blog.author}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blogs/:id" element={<BlogDetails />} />
      </Routes>
    </Router>
  );
}
