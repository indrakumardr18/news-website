// server/middleware/auth.js

const jwt = require('jsonwebtoken');
// REMOVE THIS LINE: const config = require('config');


// Middleware function to verify JWT
module.exports = function(req, res, next) {
  // Get token from header
  // Common practice: use 'x-auth-token' for custom tokens, or 'Authorization' with 'Bearer ' prefix
  const token = req.header('x-auth-token'); // Or req.header('Authorization').replace('Bearer ', '')

  // Check if no token
  if (!token) {
    // 401 Unauthorized - user trying to access without a token
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // jwt.verify takes the token, the secret, and a callback
    // This is already correct, using process.env.JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information from the token payload to the request object
    // This allows subsequent route handlers to access req.user.id and req.user.role
    req.user = decoded.user; // 'user' property from the payload you defined in login route
    next(); // Move to the next middleware or route handler
  } catch (err) {
    // Token is not valid (e.g., expired, malformed)
    res.status(401).json({ msg: 'Token is not valid' });
  }
};