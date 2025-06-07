// client/src/components/auth/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth hook

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '' // For client-side password confirmation
  });

  const { username, email, password, confirmPassword } = formData;
  const { register } = useAuth(); // Get the register function from AuthContext

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Call the register function from AuthContext
    const success = await register(username, email, password);
    // The register function in AuthContext already handles navigation and toasts
    // No need for additional toasts or navigation here unless specific post-register logic is needed
  };

  return (
    <div className="auth-container"> {/* You'll need to add styling for this class */}
      <h2>Register</h2>
      <form onSubmit={onSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="auth-button">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;