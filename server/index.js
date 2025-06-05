// 1. Import the express library
const express = require('express');

// Important cros

const cors = require('cors'); // Import the cors package


const mongoose = require('mongoose'); // Import Mongoose
require('dotenv').config(); // Load environment variables from .env file


// 2. Create an instance of the express application
const app = express();

// 3. Define the port our server will listen on
const PORT = process.env.PORT || 3000; // Use port from environment variable or default to 3000

// 4. Define a route handler for GET requests to the root URL ('/')
// When someone visits http://localhost:3000/, this function will run.
app.get('/', (req, res) => {
  res.send('Hello, World! Welcome to our News App Backend!');
});


// Middleware to parse JSON bodies
// This is important! It tells Express to expect and parse JSON data in incoming requests.
app.use(express.json());
app.use(cors()); // Use the cors middleware to allow cross-origin requests

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));
// ----------------------------------------------------

// ----------------------------------------------------
// Define Mongoose Schema and Model for News Articles
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, default: 'https://via.placeholder.com/150' },
  publishedDate: { type: Date, default: Date.now },
  // You can add more fields later, e.g., views, tags, comments
});

const Article = mongoose.model('Article', articleSchema); // Create the Article model
// ----------------------------------------------------

// ----------------------------------------------------
// Existing "Hello, World!" route
app.get('/', (req, res) => {
  res.send('Hello, World! Welcome to our News App Backend!');
});
// ----------------------------------------------------

// ----------------------------------------------------
// NEW: API endpoint to get all articles from the database
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedDate: -1 }); // Fetch all articles, sort by date
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ message: 'Server error fetching articles.' });
  }
});

// ----------------------------------------------------
// NEW: API endpoint to get a single article by ID
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters
    const article = await Article.findById(id); // Find article by its MongoDB _id

    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    res.json(article);
  } catch (err) {
    console.error(`Error fetching article with ID ${req.params.id}:`, err);
    // Mongoose can throw a CastError if ID format is invalid
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid article ID format.' });
    }
    res.status(500).json({ message: 'Server error fetching article.' });
  }
});
// ----------------------------------------------------

// ----------------------------------------------------
// NEW: API endpoint to create a new article
app.post('/api/articles', async (req, res) => {
  try {
    // Extract article data from the request body
    const { title, content, category, author, imageUrl } = req.body;

    // Basic validation (can be more robust later)
    if (!title || !content || !category || !author) {
      return res.status(400).json({ message: 'Please provide title, content, category, and author.' });
    }

    // Create a new Article document using the Mongoose model
    const newArticle = new Article({
      title,
      content,
      category,
      author,
      imageUrl: imageUrl || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image', // Default image if not provided
      publishedDate: new Date() // Set current date/time
    });

    // Save the new article to the database
    const savedArticle = await newArticle.save();

    // Respond with the newly created article and a 201 Created status
    res.status(201).json(savedArticle);

  } catch (err) {
    console.error('Error creating article:', err);
    // Mongoose validation errors will have an 'errors' property
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error creating article.' });
  }
});
// ----------------------------------------------------
// NEW: API endpoint to delete an article by ID
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(id); // Find and delete by _id

    if (!deletedArticle) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    // Respond with a 204 No Content status if successful (common for DELETE)
    // Or you can send the deleted article: res.json(deletedArticle);
    res.status(204).send(); // No content to send back, just success confirmation

  } catch (err) {
    console.error(`Error deleting article with ID ${req.params.id}:`, err);
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid article ID format.' });
    }
    res.status(500).json({ message: 'Server error deleting article.' });
  }
});
// ----------------------------------------------------

// ----------------------------------------------------
// NEW: API endpoint to update an article by ID
app.put('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, author, imageUrl } = req.body;

    // Basic validation
    if (!title || !content || !category || !author) {
      return res.status(400).json({ message: 'Please provide title, content, category, and author for update.' });
    }

    // Find the article by ID and update it.
    // { new: true } returns the updated document instead of the original.
    // { runValidators: true } ensures schema validators run on update.
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { title, content, category, author, imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    res.json(updatedArticle); // Respond with the updated article

  } catch (err) {
    console.error(`Error updating article with ID ${req.params.id}:`, err);
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid article ID format.' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error updating article.' });
  }
});
// ----------------------------------------------------

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server.');
});


// // Our mock news articles (for now, hardcoded)
// const mockArticles = [
//   {
//     id: '1',
//     title: 'Local Elections: New Mayor Pledges Community Growth',
//     content: 'In a closely contested race, Sarah Chen has been elected as the new mayor, promising initiatives focused on urban development and public services...',
//     category: 'Politics',
//     author: 'Reporter A',
//     imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Election',
//     publishedDate: '2025-06-03T10:00:00Z'
//   },
//   {
//     id: '2',
//     title: 'Tech Giant Unveils Revolutionary AI Chip',
//     content: 'InnovateCorp announced today a breakthrough in artificial intelligence hardware, claiming their new chip will dramatically accelerate AI computations...',
//     category: 'Technology',
//     author: 'Tech Guru',
//     imageUrl: 'https://via.placeholder.com/150/3366FF/FFFFFF?text=AI+Chip',
//     publishedDate: '2025-06-02T14:30:00Z'
//   },
//   {
//     id: '3',
//     title: 'City Marathon Breaks Participation Records',
//     content: 'Thousands of runners took to the streets for the annual city marathon, setting a new record for participants and raising millions for charity...',
//     category: 'Sports',
//     author: 'Sports Fan',
//     imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Marathon',
//     publishedDate: '2025-06-01T09:15:00Z'
//   }
// ];

// // New API endpoint to get all articles
// app.get('/api/articles', (req, res) => {
//   // When this endpoint is hit, send the mockArticles array as a JSON response.
//   // Express's res.json() method automatically sets the Content-Type header to application/json.
//   res.json(mockArticles);
// });

// // 5. Start the server and make it listen for incoming requests
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
//   console.log('Press Ctrl+C to stop the server.');
// });