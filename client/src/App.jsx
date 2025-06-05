// client/src/App.jsx

import React from 'react'; // No need for useState, useEffect here anymore
import { Routes, Route, Link, } from 'react-router-dom';

import ArticleDetail from './components/ArticleDetail';
import ArticleForm from './components/ArticleForm';
import HomeComponent from './components/HomeComponent';
import './App.css';

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

  return (
    <div className="App">
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
        <Route path="/create-article" element={<ArticleForm />} /> {/* Removed onSuccess={refreshArticles} */}
        
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>

      {/* Add this footer section */}
      <footer>
        <p>&copy; {new Date().getFullYear()} News Website. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;