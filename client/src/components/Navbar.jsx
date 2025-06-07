// client/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Your existing CSS file
import { useAuth } from "../contexts/AuthContext"; // Corrected path
function Navbar() {
const { isAuthenticated, logout, user } = useAuth(); // Get auth state and user from context

  // Links to show when the user IS authenticated
  const authLinks = (
    <ul className="nav-links">
      <li>
        <span className="nav-item welcome-text">Welcome, {user ? user.username : 'User'}!</span>
      </li>
      <li>
        <Link to="/" className="nav-item">Home</Link>
      </li>
      <li>
        <Link to="/create-article" className="nav-item">Create Article</Link>
      </li>
      {/* Add a link to user profile here later, e.g., <li><Link to="/profile">Profile</Link></li> */}
      <li>
        <a onClick={logout} className="nav-item logout-link" href="#!">Logout</a> {/* Using <a> with onClick for logout */}
      </li>
    </ul>
  );

  // Links to show when the user is NOT authenticated (guest)
  const guestLinks = (
    <ul className="nav-links">
      <li>
        <Link to="/" className="nav-item">Home</Link>
      </li>
      {/* Create Article link is now protected by PrivateRoute,
         so it doesn't necessarily need to be shown here, but can be.
         If you want to keep it here, users will be redirected by PrivateRoute. */}
      {/* <li>
        <Link to="/create-article" className="nav-item">Create Article</Link>
      </li> */}
      <li>
        <Link to="/register" className="nav-item">Register</Link>
      </li>
      <li>
        <Link to="/login" className="nav-item">Login</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          News Hub
        </Link>
        {/* Conditionally render authLinks or guestLinks based on isAuthenticated */}
        {isAuthenticated ? authLinks : guestLinks}
      </div>
    </nav>
  );
}

export default Navbar;