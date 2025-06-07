// client/src/components/routing/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth hook

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Get auth status and loading state

  // While authentication status is being checked (e.g., during initial token verification)
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2em' }}>
        Loading authentication...
      </div>
    );
  }

  // If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // 'replace' avoids adding to history
  }

  // If authenticated, render the children (the protected component)
  return children;
};

export default PrivateRoute;