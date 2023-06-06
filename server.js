const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Create the Express app
const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./config/passport')(passport);

// Routes
const usersRoutes = require('./routes/users');
const createPostRouter = require('./routes/createPost');
const createCommentRouter = require('./routes/createComment'); // Import the createComment router
const User = require('./models/Users');

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('Error fetching users data:', err);
    res.status(500).json({ success: false, error: 'Error fetching users data' });
  }
});

app.use('/api/users', usersRoutes);
app.use('/api/createPost', createPostRouter);
app.use('/api/createComment', createCommentRouter); // Use the createComment router
app.use((req,res)=>{
  res.send('API is running')
})

// GET all comments for a blog post
app.get('/api/blogPosts/comments', async (req, res) => {
  try {
    const { postId } = req.query; // Retrieve postId from query parameters

    // Find the user with the matching blog post
    const user = await User.findOne({ 'blogPosts._id': postId });
    if (!user) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Find the specific blog post within the user's blogPosts array
    const blogPost = user.blogPosts.find((post) => post._id.toString() === postId);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Get the comments from the blog post
    const comments = blogPost.comments;

    res.status(200).json({ success: true, comments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ success: false, error: 'Error fetching comments' });
  }
});

// POST create comment
app.post('/api/createComment', async (req, res) => {
  try {
    const { postId, userId, content } = req.body;

    // Find the user with the matching blog post
    const user = await User.findOne({ 'blogPosts._id': postId });
    if (!user) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Find the specific blog post within the user's blogPosts array
    const blogPost = user.blogPosts.find((post) => post._id.toString() === postId);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Create a new comment object
    const newComment = {
      userId,
      content,
    };

    // Add the new comment to the blog post's comments array
    blogPost.comments.push(newComment);

    // Save the user document (including the updated blog post)
    await user.save();

    res.status(200).json({ success: true, comment: newComment });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ success: false, error: 'Error creating comment' });
  }
});

// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
