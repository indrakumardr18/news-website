// client/src/components/HomeComponent.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomeComponent() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
//   const navigate = useNavigate();

  // ----------------------------------------------------
  // MOVE refreshArticles HERE from App.jsx
  const refreshArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/articles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("Failed to load articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // MOVE this useEffect HERE from App.jsx
  useEffect(() => {
    refreshArticles();
  }, []); // Run once on mount
  // ----------------------------------------------------

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete article.');
        }

        refreshArticles(); // Refresh the list after deletion
        alert("Article deleted successfully!");
      } catch (err) {
        console.error('Error deleting article:', err);
        alert(`Error deleting article: ${err.message}`);
      }
    }
  };

  if (loading) {
    return <h2>Loading news articles...</h2>;
  }

  if (error) {
    return <h2 style={{ color: 'red' }}>Error: {error}</h2>;
  }

  return (
    <>
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <Link to="/create-article" className="create-article-link">Create New Article</Link>
      </div>

      <h1>Latest News</h1>
      <div className="articles-container">
        {articles.length > 0 ? (
          articles.map(article => (
            <div key={article._id} className="article-card">
              {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="article-image" />}
              <h2>{article.title}</h2>
              <p className="article-author-date">By {article.author} | {new Date(article.publishedDate).toLocaleDateString()}</p>
              <p>{article.content.substring(0, 150)}...</p>
              <span className="article-category">{article.category}</span>
              <div className="article-actions">
                <Link to={`/article/${article._id}`} className="read-more">Read More</Link>
                <button onClick={() => handleDelete(article._id)} className="delete-button">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No news articles found.</p>
        )}
      </div>
    </>
  );
}

export default HomeComponent;