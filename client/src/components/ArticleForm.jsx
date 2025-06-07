// client/src/components/ArticleForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom'; // <-- Add useParams for edit functionality if you use it directly
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext'; // <-- This import is correct!

// Accept an optional 'article' prop and 'onSuccess' callback
// IMPORTANT: We also need 'mode' here as per App.jsx routes
function ArticleForm({ article, onSuccess, mode }) { // <-- Make sure 'mode' is a prop here
  const { id } = useParams(); // Get ID from URL for editing directly if needed
  const navigate = useNavigate();
  const { token } = useAuth(); // <-- GET THE TOKEN HERE!

  // Initialize state based on article prop if in edit mode, or empty for create mode
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '', // This should ideally come from req.user.username on backend
    imageUrl: '',
    publishedDate: '' // Add this for consistency with backend
  });

  const { title, content, category, author, imageUrl, publishedDate } = formData;
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});


  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    if (!content.trim()) {
      errors.content = 'Content is required';
    }
    if (!category.trim()) {
      errors.category = 'Category is required';
    }
    if (!author.trim()) { // Note: The backend will set author based on logged-in user
      errors.author = 'Author is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Use useEffect to update form fields if 'article' prop changes (e.g., when editing a different article)
  useEffect(() => {
    if (mode === 'edit' && article) { // Use 'mode' prop to determine edit behavior
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        author: article.author,
        imageUrl: article.imageUrl || '',
        publishedDate: article.publishedDate ? article.publishedDate.substring(0, 10) : '' // Format date
      });
    } else if (mode === 'create') {
      // Clear form for new article or set defaults
      setFormData({
        title: '',
        content: '',
        category: '',
        author: '',
        imageUrl: '',
        publishedDate: ''
      });
    }
    setMessage(''); // Clear messages on article change
  }, [article, mode]); // Re-run effect if the 'article' or 'mode' prop changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // clear previous messages

    const isValid = validateForm();
    if (!isValid) {
      setMessage('Please correct the form errors.');
      return;
    }
    setIsSubmitting(true);

    const method = mode === 'edit' ? 'PUT' : 'POST'; // Determine method based on 'mode' prop
    const url = mode === 'edit' ? `http://localhost:3000/api/articles/${id}` : 'http://localhost:3000/api/articles';


    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // <-- THIS IS THE CRITICAL LINE! Include the JWT
        },
        // Send formData directly as it contains all fields
        body: JSON.stringify(formData), // Send all form data, including publishedDate
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check for 401/403 specifically
        if (response.status === 401 || response.status === 403) {
          toast.error('You are not authorized to perform this action. Please log in.');
          // Optionally, redirect to login if unauthorized
          navigate('/login');
        } else {
          toast.error(errorData.msg || `Failed to ${mode} article.`);
        }
        throw new Error(errorData.message || `${mode === 'edit' ? 'Failed to update' : 'Failed to create'} article.`);
      }

      const resultArticle = await response.json();
      toast.success(`Article ${mode === 'edit' ? 'updated' : 'created'} successfully!`);

      console.log(`${mode === 'edit' ? 'Updated' : 'Created'} article:`, resultArticle);

      if (onSuccess) { // This prop is less common now that App.jsx handles refresh/redirect
        onSuccess(resultArticle);
      }

      // Redirect after success
      setTimeout(() => {
        navigate(`/article/${resultArticle._id || id}`); // Redirect to the new/updated article
      }, 1500);

    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} article:`, error);
      setMessage(`Error: ${error.message}`);
      // Only show a general error toast if no specific one was shown above
      if (!toast.isActive('fetchError') && !error.message.includes('authorized')) {
        toast.error('Network error or server issue. Please try again.', { toastId: 'fetchError' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of your return JSX for the form (no changes needed here) ...
  return (
    <div className="article-form-container">
      <h2>{mode === 'create' ? 'Create New News Article' : 'Edit News Article'}</h2>
      {message && <p className = {`form-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
          type="text"
          id="title"
          name="title" // Add name attribute for consistency
          value={title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })} // Use setFormData
          required
           />
           {validationErrors.title && <span className = "error-message">{validationErrors.title}</span>}
        </div>


        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
          id="content"
          name="content" // Add name attribute
          value={content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows="8"
          required
          ></textarea>
          {validationErrors.content && <span className="error-message">{validationErrors.content}</span>}
        </div>


        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <input
          type="text"
          id="category"
          name="category" // Add name attribute
          value={category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          />
          {validationErrors.category && <span className="error-message">{validationErrors.category}</span>}
        </div>


        <div className="form-group">
          <label htmlFor="author">Author:</label>
          <input
          type="text"
          id="author"
          name="author" // Add name attribute
          value={author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
          />
        {validationErrors.author && <span className="error-message">{validationErrors.author}</span>}
        </div>


        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional):</label>
          <input
          type="url"
          id="imageUrl"
          name="imageUrl" // Add name attribute
          value={imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="e.g., https://example.com/image.jpg" />
        </div>

        <div className="form-group">
          <label htmlFor="publishedDate">Published Date:</label>
          <input
            type="date"
            id="publishedDate"
            name="publishedDate"
            value={publishedDate}
            onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Article' : 'Create Article')}
        </button>
      </form>
      {article && <Link to={`/article/${article._id}`} className="back-link" style={{marginTop: '20px', display: 'block'}}>← Back to Article</Link>}
    </div>
  );
}

export default ArticleForm;