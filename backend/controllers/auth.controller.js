const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  const { username, password, role } = req.body;
  console.log('Register attempt for user:', username, 'with role:', role);

  try {
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      console.log('User already exists:', username);
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    console.log('Creating new user...');
    const user = await User.create({
      username,
      password,
      role,
    });

    if (user) {
      console.log('User created successfully:', user.username);
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      console.log('Invalid user data during creation');
      res.status(400).json({ success: false, error: 'Invalid user data' });
    }
  } catch (err) {
    console.error('Error during user registration:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    // req.user is set by the protect middleware
    res.status(200).json({ success: true, data: req.user });
};