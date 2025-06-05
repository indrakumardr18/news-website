// client/src/components/ArticleDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Remove the 'articles' prop from here:
function ArticleDetail() {
  const { id } = useParams(); // Get the 'id' parameter from the URL
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSingleArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        // Now, we fetch the specific article from the backend using its ID
        const response = await fetch(`http://localhost:3000/api/articles/${id}`);

        if (!response.ok) {
          // If response status is not 2xx (e.g., 404, 500)
          const errorData = await response.json(); // Try to parse error message from backend
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error("Failed to fetch single article:", err);
        setError(err.message || "Failed to load article. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleArticle();
  }, [id]); // Dependency array: Re-run this effect ONLY when the 'id' parameter changes

  if (loading) {
    return <div className="article-detail-container">Loading article...</div>;
  }

  if (error) {
    return <div className="article-detail-container" style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!article) { // Should not happen if error handling is robust, but good fallback
    return <div className="article-detail-container">Article not found.</div>;
  }

  return (
    <div className="article-detail-container">
      <Link to="/" className="back-link">← Back to Home</Link>
      {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="detail-image" />}
      <h1>{article.title}</h1>
      <p className="detail-author-date">By {article.author} | {new Date(article.publishedDate).toLocaleDateString()}</p>
      <p className="detail-content">{article.content}</p>
      <span className="detail-category">{article.category}</span>
    </div>
  );
}

export default ArticleDetail;