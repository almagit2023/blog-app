import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./App.css";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', author: '' });
  const [searchKeyword, setSearchKeyword] = useState(''); // State for search input

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/blogs/search?keyword=${searchKeyword}`);
      setBlogs(response.data); // Update the blogs list with search results
    } catch (error) {
      console.error('Error searching blogs:', error);
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newBlog.title);
    formData.append('content', newBlog.content);
    formData.append('author', newBlog.author);
    formData.append('image', newBlog.image); // Include the image file

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
    if (!confirmDelete) return; // Exit if the user cancels

    try {
      await axios.delete(`http://localhost:5000/blogs/${id}`);
      const updatedBlogs = blogs.filter((blog) => blog._id !== id);
      setBlogs(updatedBlogs);
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };


  const handleEditBlog = async (id) => {
    const updatedTitle = prompt('Enter the new title:'); // Prompt user for new title
    if (!updatedTitle) return; // Exit if the user cancels or provides no input

    try {
      const response = await axios.patch(`http://localhost:5000/blogs/${id}`, { title: updatedTitle });
      const updatedBlogs = blogs.map((blog) => (blog._id === id ? response.data : blog));
      setBlogs(updatedBlogs);
    } catch (error) {
      console.error('Error editing blog:', error);
    }
  };


  return (
    <div class="blog-app">
      <div class="create-blog">
        <h1>My Blog</h1>

        {/* Search Input */}

        <div class="form-blog">
          {/* Blog Creation Form */}
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
      </div>

      {/* Display Blogs */}
      <div class="display-blog">
        <div class="search-blog">
          <h3>Search by  title</h3>
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
              <li key={blog._id}>
                <h3>{blog.title}</h3>
                {blog.image && <img src={blog.image} alt={blog.title} style={{ width: '25%', borderRadius: '5px' }} />}
                <p>By {blog.author}</p>
                <p>{blog.content}...</p>
                <div className="btn-set">
                  <button onClick={() => handleEditBlog(blog._id)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDeleteBlog(blog._id)} className="btn-delete">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
