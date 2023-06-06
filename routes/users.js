// users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

const User = require('../models/Users');

// Register route
router.post('/register', (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  // Check if the username or email is already taken
  User.findOne({ $or: [{ username: username }, { email: email }] })
    .then(existingUser => {
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already taken' });
      }

      // Create a new user
      const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password
      });

      // Hash the password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        // Update the user's password with the hashed password
        newUser.password = hashedPassword;

        // Save the user to the database
        newUser.save()
          .then(user => {
            res.json({ message: 'User registered successfully', id: user.id });})
          .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Server error' });
          });
      });

    })
    .catch(err => console.log(err));
});


// Login route
router.post('/login', (req, res, next) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }
  
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      req.logIn(user, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        // Include the user ID in the response
        return res.json({ message: 'Login successful', id: user.id });
      });
    })(req, res, next);
  });
  

module.exports = router;
