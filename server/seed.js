// server/seed.js

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Define the same Article Schema and Model as in index.js
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, default: 'https://via.placeholder.com/150' },
  publishedDate: { type: Date, default: Date.now },
});
const Article = mongoose.model('Article', articleSchema);

// Mock articles to insert
const mockArticles = [
  {
    title: 'Global Markets See Unexpected Surge',
    content: 'Analysts are scrambling to understand the sudden upward trend in global stock markets, attributing it to a combination of strong corporate earnings and decreasing inflation fears...',
    category: 'Economy',
    author: 'Financial Times',
    imageUrl: 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Stocks',
    publishedDate: new Date('2025-06-04T12:00:00Z')
  },
  {
    title: 'New Study Reveals Benefits of Mindfulness in Workplace',
    content: 'A groundbreaking research paper from leading universities suggests that daily mindfulness practices significantly improve employee productivity and reduce stress levels...',
    category: 'Health',
    author: 'Dr. Wellness',
    imageUrl: 'https://via.placeholder.com/150/8A2BE2/FFFFFF?text=Mindfulness',
    publishedDate: new Date('2025-06-03T18:00:00Z')
  },
  {
    title: 'Arctic Ice Melt Accelerates, Posing Climate Challenges',
    content: 'Satellite data indicates a concerning acceleration in Arctic sea ice melt, prompting urgent calls from environmental scientists for immediate climate action...',
    category: 'Environment',
    author: 'Climate Watch',
    imageUrl: 'https://via.placeholder.com/150/00CED1/FFFFFF?text=Arctic',
    publishedDate: new Date('2025-06-02T09:45:00Z')
  },
  {
    title: 'Local Elections: New Mayor Pledges Community Growth',
    content: 'In a closely contested race, Sarah Chen has been elected as the new mayor, promising initiatives focused on urban development and public services in her inaugural address...',
    category: 'Politics',
    author: 'City Herald',
    imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Election',
    publishedDate: new Date('2025-06-01T10:00:00Z')
  },
  {
    title: 'Tech Giant Unveils Revolutionary AI Chip',
    content: 'InnovateCorp announced today a breakthrough in artificial intelligence hardware, claiming their new chip will dramatically accelerate AI computations across various industries...',
    category: 'Technology',
    author: 'Tech Daily',
    imageUrl: 'https://via.placeholder.com/150/3366FF/FFFFFF?text=AI+Chip',
    publishedDate: new Date('2025-05-30T14:30:00Z')
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding!');

    // Clear existing articles to prevent duplicates on re-run
    await Article.deleteMany({});
    console.log('Existing articles cleared.');

    // Insert new mock articles
    await Article.insertMany(mockArticles);
    console.log('Mock articles seeded successfully!');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

seedDatabase();