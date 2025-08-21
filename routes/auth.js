const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// Add a validation utility for the mobile number length check
const validateNumber = (number) => {
    const regex = /^\d{10}$/; // Regex for validating a 10-digit number
    return regex.test(number);
  };
  
  router.post('/signup', async (req, res) => {
    try {
      const { username, email, password, confirmPassword, number } = req.body;
  
      // Check for missing fields
      if (!username || !email || !password || !confirmPassword || !number) {
        return res.render('signup', { error: 'All fields are required' });
      }
  
      // Password match validation
      if (password !== confirmPassword) {
        return res.render('signup', { error: 'Passwords do not match' });
      }
  
      // Number validation
      if (!validateNumber(number)) {
        return res.render('signup', { error: 'Enter a valid 10-digit mobile number' });
      }
  
      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.render('signup', { error: 'Username or email already exists' });
      }
  
      // Create new user
      const newUser = new User({ username, email, password, number });
      await newUser.save();
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      res.render('signup', { error: 'Signup failed. Please try again.' });
    }
  });
  
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { error: 'Login failed' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;
