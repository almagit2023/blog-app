import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BlogDetails() {
  const { id } = useParams(); // Extract the 'id' from the route
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedBlog, setUpdatedBlog] = useState({ title: '', content: '', author: '', image: null });

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/blogs/${id}`);
      setBlog(response.data);
      setUpdatedBlog({
        title: response.data.title,
        content: response.data.content,
        author: response.data.author,
        image: response.data.image || null,
      });
    } catch (error) {
      console.error('Error fetching blog details:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBlog({ ...updatedBlog, [name]: value });
  };

  const handleImageChange = (e) => {
    setUpdatedBlog({ ...updatedBlog, image: e.target.files[0] });
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', updatedBlog.title);
    formData.append('content', updatedBlog.content);
    formData.append('author', updatedBlog.author);
    if (updatedBlog.image instanceof File) {
      formData.append('image', updatedBlog.image); // Only append if a new image is uploaded
    }

    try {
      await axios.patch(`http://localhost:5000/blogs/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsEditing(false);
      fetchBlogDetail(); // Refresh the blog details
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedBlog({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      image: blog.image || null,
    });
  };

  return (
    <div className='blog-detail-edit'>
      {blog ? (
        <div>
          {isEditing ? (
            <form onSubmit={handleUpdateBlog}>
              <div>
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={updatedBlog.title}
                  onChange={handleFieldChange}
                />
              </div>
              <div>
                <label htmlFor="content">Content:</label>
                <textarea
                  id="content"
                  name="content"
                  value={updatedBlog.content}
                  onChange={handleFieldChange}
                />
              </div>
              <div>
                <label htmlFor="author">Author:</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={updatedBlog.author}
                  onChange={handleFieldChange}
                />
              </div>
              <div>
                <label htmlFor="image">Image:</label>
                <input type="file" id="image" onChange={handleImageChange} />
              </div>
              <div className='edit-btns-group'>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2>{blog.title}</h2>
              <p>{blog.content}</p>
              <p>By {blog.author}</p>
              {blog.image && <img src={blog.image} alt={blog.title} style={{ width: '25%', borderRadius: '10px' }} />}
              <div className='edit-btns-group'>
                <button onClick={handleEditToggle}>Edit</button>
                <button onClick={() => navigate('/')}>Back to Blogs</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default BlogDetails;
