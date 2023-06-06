const express = require('express');
const router = express.Router();
const User = require('../models/Users');

// POST route to create a comment for a blog post
router.post('/', async (req, res) => {
  const { postId, userId, content } = req.body;

  try {
    // Find the user and the blog post by ID
    const user = await User.findOne({ 'blogPosts._id': postId });
    if (!user) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Find the specific blog post within the user's blogPosts array
    const blogPost = user.blogPosts.find((post) => post._id.toString() === postId);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Find the username based on the userId
    const { username } = await User.findById(userId);
    if (!username) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the comment
    const comment = { username, content };

    // Add the comment to the blog post's comments array
    blogPost.comments.push(comment);

    // Save the updated user to the database
    await user.save();

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
