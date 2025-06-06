// client/src/App.jsx

import React from 'react'; // No need for useState, useEffect here anymore
import { Routes, Route, Link,useParams } from 'react-router-dom';

// NEW: Import react-toastify components and CSS
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext'; // <-- Import AuthProvider

import ArticleDetail from './components/ArticleDetail';
import ArticleForm from './components/ArticleForm';
import HomeComponent from './components/HomeComponent';
import Navbar from './components/Navbar';
import './App.css';
// NEW IMPORTS:
import Register from './components/auth/Register';
import Login from './components/auth/Login'
import PrivateRoute from './components/routing/PrivateRoute'; // <-- NEW IMPORT



function App() {
  // ----------------------------------------------------
  // DELETE THESE LINES:
  // const [articles, setArticles] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // DELETE THE refreshArticles FUNCTION DEFINITION:
  // const refreshArticles = async () => { ... };
  // DELETE THIS useEffect:
  // useEffect(() => { refreshArticles(); }, []);
  // ----------------------------------------------------

  // Now, App.jsx really only acts as the router and defines specific route components
  // that don't directly manipulate the main article list state.
  // ----------------------------------------------------
  // RE-ADD THIS EditArticlePage COMPONENT:
  const EditArticlePage = () => {
    const { id } = useParams();
    const [articleToEdit, setArticleToEdit] = React.useState(null); // Use React.useState as useState is not directly imported
    const [editLoading, setEditLoading] = React.useState(true);
    const [editError, setEditError] = React.useState(null);

    // You might need to re-import useState and useEffect at the top of App.jsx
    // or ensure you use React.useState, React.useEffect as I'm doing here for clarity.
    // It's cleaner to import them: import React, { useState, useEffect } from 'react';
    // (You should already have React, { useState, useEffect } imported at the top of App.jsx from previous steps)


    React.useEffect(() => { // Use React.useEffect here
      const fetchArticleForEdit = async () => {
        setEditLoading(true);
        setEditError(null);
        try {
          const response = await fetch(`http://localhost:3000/api/articles/${id}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch article for editing.');
          }
          const data = await response.json();
          setArticleToEdit(data);
        } catch (err) {
          console.error("Error fetching article for edit:", err);
          setEditError(err.message);
        } finally {
          setEditLoading(false);
        }
      };
      fetchArticleForEdit();
    }, [id]);

    if (editLoading) return <div className="App"><h2>Loading article for editing...</h2></div>;
    if (editError) return <div className="App" style={{ color: 'red' }}><h2>Error loading article for editing: {editError}</h2></div>;
    if (!articleToEdit) return <div className="App"><h2>Article not found for editing.</h2></div>;

    // Note: We removed the 'refreshArticles' prop from App.jsx earlier.
    // If you want HomeComponent to refresh after an edit, you'd need a way to trigger that.
    // For simplicity now, we'll keep it without 'onSuccess' here.
    // If you still want the home page to update after edit, we'll address that in a later step (e.g., using a global state or a direct fetch in HomeComponent).
    return (
      <ArticleForm article={articleToEdit} /> // Removed onSuccess prop for now
    );
  };

  return (
    <div className="App">
      
       
      <div className="routes-wrapper"> {/* NEW: Add this wrapper */}
    <AuthProvider> {/* Wrap your entire app with AuthProvider */}
    <Navbar /> 
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        {/*
          No longer passing refreshArticles to ArticleForm for creation.
          If you want the home page to update after creating a new article,
          you'd typically refresh the HomeComponent's internal state.
          For now, we'll remove it. If you need it, we'll reintroduce it via
          a prop from App that calls a method in HomeComponent.
        */}
        {/* For create-article, ArticleForm handles its own success message and redirect now */}
       {/* Protected Routes - Use ArticleForm for both create and edit */}
            <Route
              path="/create-article"
              element={
                <PrivateRoute>
                  <ArticleForm mode="create" /> {/* <-- Pass mode prop */}
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-article/:id"
              element={
                <PrivateRoute>
                  <ArticleForm mode="edit" /> {/* <-- Pass mode prop */}
                </PrivateRoute>
              }
            />
{/* NEW ROUTES: */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
  </AuthProvider>

    </div> {/* NEW: Close the wrapper */}

      {/* Add this footer section */}
      <footer>
        <p>&copy; {new Date().getFullYear()} News Website. All rights reserved.</p>
      </footer>
   

    {/* NEW: Add the ToastContainer here */}
      <ToastContainer
        position="top-right" // You can change this (e.g., "bottom-left", "top-center")
        autoClose={5000}    // How long the toast stays (in ms)
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // "light", "dark", "colored"
      />
    </div>
  );
}

export default App;