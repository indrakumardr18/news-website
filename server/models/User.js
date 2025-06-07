const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Define the User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'], // Custom error message
    unique: true, // Ensures username is unique
    trim: true, // Removes whitespace from both ends
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Ensures email is unique
    trim: true,
    lowercase: true, // Stores email in lowercase
    match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email regex validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },

  role: {
    type: String,
    enum: ['user', 'admin'], // Enforces that role can only be 'user' or 'admin'
    default: 'user' // Sets 'user' as the default role for new registrations
  },
  // Optional: For storing user-specific profile data
  profile: {
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '' // Default empty string if not provided
    },
    profilePictureUrl: {
      type: String,
      default: '' // Default empty string or a placeholder URL
    },
    // You can add more profile fields here (e.g., firstName, lastName, etc.)
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically sets creation date
  }
});

// --- Mongoose Middleware (pre-save hook for password hashing) ---

// This code runs BEFORE a user document is saved to the database.
// It's used to hash the password for security.
userSchema.pre('save', async function(next) {
  // 'this' refers to the user document being saved
  // Check if the password field has been modified (or is new)
  // Only hash if the password is new or has been changed
  if (!this.isModified('password')) {
    return next(); // If password hasn't changed, move to the next middleware/save operation
  }

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt (random string) with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the generated salt
    next(); // Move to the next middleware/save operation
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

// --- Instance Method for Password Comparison ---

// This method will be available on every user document (e.g., user.comparePassword('plainTextPass'))
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Compare the provided plain-text password with the stored hashed password
  // bcrypt handles the salt extraction and comparison automatically
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the User Model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;