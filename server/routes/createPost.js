const express = require('express');
const router = express.Router();
const User = require('../models/Users');

router.post('/', async (req, res) => {
  const { userId, title, content } = req.body;

  try {
    const user = await User.findById(userId);
    if (user) {
      const newPost = {
        title,
        content
      };

      user.blogPosts.push(newPost);

      const updatedUser = await user.save();
      res.status(201).json({ success: true, user: updatedUser });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Error updating user' });
  }
});

module.exports = router;
