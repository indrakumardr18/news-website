// 1. Import the express library
const express = require('express');
const cors = require('cors'); // Import the cors package
const mongoose = require('mongoose'); // Import Mongoose
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for JWTs
const bcrypt = require('bcryptjs'); // Import bcryptjs for password comparison

require('dotenv').config(); // Load environment variables from .env file

// Import the User model
const User = require('./models/User');

// Import express-validator for input validation
const { check, validationResult } = require('express-validator');

// Import the auth and adminAuth middleware
const auth = require('./middleware/auth'); // Your authentication middleware
const adminAuth = require('./middleware/adminAuth'); // Your new admin authorization middleware

// 2. Create an instance of the express application
const app = express();

// 3. Define the port our server will listen on
const PORT = process.env.PORT || 3000; // Use port from environment variable or default to 3000

// Middleware to parse JSON bodies and allow CORS
app.use(express.json()); // Tells Express to expect and parse JSON data in incoming requests.
app.use(cors()); // Use the cors middleware to allow cross-origin requests

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// ----------------------------------------------------
// Define Mongoose Schema and Model for News Articles
const articleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/600x400?text=No+Image'
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const Article = mongoose.model('Article', articleSchema);
// ----------------------------------------------------

// Existing "Hello, World!" route
app.get('/', (req, res) => {
  res.send('Hello, World! Welcome to our News App Backend!');
});

// --- Authentication Routes ---

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
app.post(
  '/api/auth/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('username', 'Username must be at least 3 characters long').isLength({ min: 3 }),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User with that email already exists' });
      }

      user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ msg: 'Username already taken' });
      }

      user = new User({
        username,
        email,
        password,
        role: 'user'
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
          username: user.username, // <-- ADD THIS LINE
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, msg: 'User registered successfully!' });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
app.post(
  '/api/auth/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          username: user.username, // <-- ADD THIS LINE
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get logged in user data
// @access  Private
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- Article Routes ---

// @route   GET /api/articles
// @desc    Get all articles (with optional search query)
// @access  Public
app.get('/api/articles', async (req, res) => {
  try {
    const { query } = req.query;

    let filter = {};

    if (query) {
      const searchRegex = new RegExp(query, 'i');
      filter = {
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { category: searchRegex },
          { author: searchRegex },
        ],
      };
    }

    const articles = await Article.find(filter)
      .sort({ publishedDate: -1 })
      .populate('user', ['username', 'email', 'role']);

    res.status(200).json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// @route   GET /api/articles/:id
// @desc    Get a single article by ID
// @access  Public
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id).populate('user', ['username', 'email', 'role']);

    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    res.json(article);
  } catch (err) {
    console.error(`Error fetching article with ID ${req.params.id}:`, err);
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid article ID format.' });
    }
    res.status(500).json({ message: 'Server error fetching article.' });
  }
});

// @route   POST /api/articles
// @desc    Create a new article
// @access  Private (Auth required)
app.post(
  '/api/articles',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, content, category, imageUrl, publishedDate } = req.body;

        const newArticle = new Article({
            title,
            content,
            category,
            imageUrl: imageUrl || 'https://via.placeholder.com/600x400?text=No+Image',
            publishedDate: publishedDate || Date.now(),
            user: req.user.id,
            author: req.user.username
        });

        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);

    } catch (err) {
      console.error('Error creating article:', err);
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      res.status(500).json({ message: 'Server error creating article.' });
    }
  }
);

// @route   PUT /api/articles/:id
// @desc    Update an article (only by owner or admin)
// @access  Private (Auth required)
app.put(
  '/api/articles/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, imageUrl } = req.body;

    const articleFields = {};
    if (title) articleFields.title = title;
    if (content) articleFields.content = content;
    if (category) articleFields.category = category;
    if (imageUrl) articleFields.imageUrl = imageUrl;

    try {
      let article = await Article.findById(req.params.id);

      if (!article) {
        return res.status(404).json({ msg: 'Article not found' });
      }

      if (article.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'User not authorized to update this article' });
      }

      article = await Article.findByIdAndUpdate(
        req.params.id,
        { $set: articleFields },
        { new: true, runValidators: true }
      );

      res.json(article);

    } catch (err) {
      console.error(err.message);
      if (err.name === 'CastError') {
        return res.status(400).json({ msg: 'Invalid article ID format.' });
      }
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /api/articles/:id
// @desc    Delete an article (only by owner or admin)
// @access  Private (Auth required)
app.delete(
  '/api/articles/:id',
  auth,
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);

      if (!article) {
        return res.status(404).json({ msg: 'Article not found' });
      }

      if (article.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'User not authorized to delete this article' });
      }

      await Article.findByIdAndDelete(req.params.id);

      res.status(204).send();

    } catch (err) {
      console.error(err.message);
      if (err.name === 'CastError') {
        return res.status(400).json({ msg: 'Invalid article ID format.' });
      }
      res.status(500).send('Server Error');
    }
    // REMOVED: Redundant error response here: res.status(500).json({ message: 'Server error updating article.' });
  }
);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server.');
});