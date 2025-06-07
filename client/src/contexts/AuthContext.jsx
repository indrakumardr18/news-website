import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// 1. Create the AuthContext
const AuthContext = createContext(null);

// 2. Create the AuthProvider Component
export const AuthProvider = ({ children }) => {
  // State to hold the authentication token (from localStorage)
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  // State to hold the authenticated user's data
  const [user, setUser] = useState(null);
  // State to indicate if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to manage the initial authentication check loading status
  const [loading, setLoading] = useState(true); // Starts as true because we're checking authentication

  const navigate = useNavigate();

  // --- loadUser function ---
  // This asynchronous function attempts to verify the token with the backend
  // and load the user's data.
  // It's designed to be called when the app starts or when the token state changes.
  const loadUser = async (currentAuthToken) => {
    console.log('AuthContext: loadUser called with token:', currentAuthToken ? 'present' : 'absent');

    setLoading(true); // Set loading to true at the start of any user load attempt

    if (currentAuthToken) {
      try {
        console.log('AuthContext: Attempting to fetch /api/auth/me for token verification.');
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'x-auth-token': currentAuthToken, // Send the token for verification
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          console.log('AuthContext: User loaded successfully:', userData.username);
        } else {
          // Token invalid, expired, or backend rejected it (e.g., 401, 403)
          console.error("AuthContext: Token verification failed, status:", response.status, response.statusText);
          // Clear everything locally if token is not valid
          localStorage.removeItem('token');
          setToken(null); // Setting null triggers the useEffect again, leading to the else branch below
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Network error or other fetch-related issues
        console.error('AuthContext: Error verifying token during loadUser (network/server issue):', error);
        localStorage.removeItem('token');
        setToken(null); // Clear token, triggering useEffect again
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Ensure loading is set to false after the API call completes,
        // whether it succeeded or failed.
        setLoading(false);
        console.log('AuthContext: loadUser completed. Loading is now false.');
      }
    } else {
      // No token found in localStorage or it was just cleared
      console.log('AuthContext: No token present. Setting isAuthenticated to false.');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false); // Authentication check is complete if no token
      console.log('AuthContext: No token found. Loading is now false.');
    }
  };

  // --- useEffect hook ---
  // This hook runs once on component mount and whenever the `token` state changes.
  // It's responsible for initiating the `loadUser` check.
  useEffect(() => {
    console.log('AuthContext: useEffect triggered. Current token state:', token ? 'present' : 'absent');
    // Call loadUser with the token from state (which reflects localStorage)
    // The loadUser function handles its own loading state internally now
    loadUser(token);
  }, [token]); // Dependency array: re-run if the 'token' state changes

  // --- Login Function ---
  const login = async (email, password) => { // Backend expects 'username' not 'email' for login
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Use username for login
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Login failed. Invalid credentials.');
        return false;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token); // Update token state. This will trigger useEffect which then calls loadUser.
      // No need to manually call loadUser() here, useEffect will handle the full user load.
      toast.success('Login successful!');
      navigate('/'); // Redirect to home page on successful login
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error or server problem during login.');
      return false;
    }
  };

  // --- Register Function ---
  const register = async (username, email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Registration failed');
      }

      const data = await response.json();
      toast.success(data.msg); // "User registered successfully!"
      navigate('/login'); // Redirect to login page after successful registration
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message);
      return false;
    }
    return true;
  };

  // --- Logout Function ---
  const logout = () => {
    console.log('AuthContext: logout called.');
    localStorage.removeItem('token'); // Remove token from localStorage
    setToken(null); // Clear token state, which triggers useEffect for cleanup
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out.');
    navigate('/login'); // Redirect to login page
    // setLoading(false) is now handled by the useEffect after token becomes null
  };

  // The value provided by the context to its consumers
  const authContextValue = {
    token,
    user,
    isAuthenticated,
    loading, // Provide loading state for initial auth check
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a Custom Hook for easier consumption of the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};