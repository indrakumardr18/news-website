// server/middleware/adminAuth.js

module.exports = function (req, res, next) {
  // Check if req.user exists (meaning auth middleware has already run and attached user)
  if (!req.user) {
    return res.status(401).json({ msg: 'No user authenticated, authorization denied' });
  }

  // Check if the authenticated user has the 'admin' role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Administrator privileges required.' });
  }

  // If user is admin, proceed to the next middleware/route handler
  next();
};