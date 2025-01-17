const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('./cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-images', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed image formats
  },
});

const upload = multer({ storage });
const app = express();
const port = 5000; //process.env.PORT

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB


mongoose.connect('mongodb://127.0.0.1:27017/blog-db')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Define Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  image: { type: String }, // URL of the uploaded image
  date: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', blogSchema);

// API Routes
app.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getBlog(req, res, next) {
  let blog;
  try {
    blog = await Blog.findById(req.params.id);
    console.log('Found blog:', blog); // Log the found blog
    if (blog == null) {
      return res.status(404).json({ message: 'Cannot find blog' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.blog = blog;
  next();
}
// Search Blogs by Title or Content
app.get('/blogs/search', async (req, res) => {
  const { keyword } = req.query; // Get the search keyword from the query params
  if (!keyword) {
    return res.status(400).json({ message: 'Keyword is required for search' });
  }

  try {
    // Search for blogs where the title or content includes the keyword
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } }, // Case-insensitive search in title
        { content: { $regex: keyword, $options: 'i' } } // Case-insensitive search in content
      ]
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/blogs', upload.single('image'), async (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    image: req.file ? req.file.path : null, // Store the image URL if uploaded
  });

  try {
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/blogs/:id', getBlog, (req, res) => {
  res.json(res.blog);
});

app.patch('/blogs/:id', getBlog, async (req, res) => {
  if (req.body.title != null) {
    res.blog.title = req.body.title; // Update title
  }
  if (req.body.content != null) {
    res.blog.content = req.body.content; // Update content
  }
  if (req.body.author != null) {
    res.blog.author = req.body.author; // Update author
  }

  try {
    const updatedBlog = await res.blog.save(); // Save the updated blog
    res.json(updatedBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


app.delete('/blogs/:id', getBlog, async (req, res) => {
  try {
    await Blog.deleteOne({ _id: req.params.id });
    res.json({ message: 'Blog Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



async function getBlog(req, res, next) {
  let blog;
  try {
    blog = await Blog.findById(req.params.id);
    if (blog == null) {
      return res.status(404).json({ message: 'Cannot find blog' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.blog = blog;
  next();
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});