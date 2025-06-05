// client/src/components/ArticleForm.jsx

import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';

// Accept an optional 'article' prop and 'onSuccess' callback
function ArticleForm({ article, onSuccess }) {
  const [title, setTitle] = useState(article ? article.title : '');
  const [content, setContent] = useState(article ? article.content : '');
  const [category, setCategory] = useState(article ? article.category : '');
  const [author, setAuthor] = useState(article ? article.author : '');
  const [imageUrl, setImageUrl] = useState(article ? article.imageUrl : '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Use useEffect to update form fields if 'article' prop changes (e.g., when editing a different article)
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setCategory(article.category);
      setAuthor(article.author);
      setImageUrl(article.imageUrl || '');
    } else {
      // Clear form if no article prop (for create mode)
      setTitle('');
      setContent('');
      setCategory('');
      setAuthor('');
      setImageUrl('');
    }
    setMessage(''); // Clear messages on article change
  }, [article]); // Re-run effect if the 'article' prop itself changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const articleData = {
      title,
      content,
      category,
      author,
      imageUrl
    };

    const method = article ? 'PUT' : 'POST'; // Determine method based on if 'article' prop exists
    const url = article ? `http://localhost:3000/api/articles/${article._id}` : 'http://localhost:3000/api/articles';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${article ? 'Failed to update' : 'Failed to create'} article.`);
      }

      const resultArticle = await response.json();
      setMessage(`Article ${article ? 'updated' : 'created'} successfully!`);
      console.log(`${article ? 'Updated' : 'Created'} article:`, resultArticle);

      // Call the onSuccess callback if provided (e.g., to refresh articles list)
      if (onSuccess) {
        onSuccess(resultArticle);
      }

      // Optional: Redirect
      setTimeout(() => {
        navigate('/'); // Redirect to home after success
      }, 1500);

    } catch (error) {
      console.error(`Error ${article ? 'updating' : 'creating'} article:`, error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="article-form-container">
      <h2>{article ? 'Edit News Article' : 'Create New News Article'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="8" required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="author">Author:</label>
          <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional):</label>
          <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="e.g., https://example.com/image.jpg" />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (article ? 'Updating...' : 'Creating...') : (article ? 'Update Article' : 'Create Article')}
        </button>
        {message && <p className={`form-message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
      </form>
      {article && <Link to={`/article/${article._id}`} className="back-link" style={{marginTop: '20px', display: 'block'}}>← Back to Article</Link>}
    </div>
  );
}

export default ArticleForm;