const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');

//// Load environment variables from .env
dotenv.config();
//
//// Create the Express app
const app = express();
//
//// Enable CORS
app.use(cors());
//
//// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

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

//// Passport configuration
require('./config/passport')(passport);

//// Routes
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);
// Start the server
app.listen(5000, () => {
  console.log('Server is running too');
});
