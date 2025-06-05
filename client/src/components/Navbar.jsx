// client/src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // We'll create this CSS file next

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          News Hub
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-item">Home</Link>
          </li>
          <li>
            <Link to="/create-article" className="nav-item">Create Article</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;