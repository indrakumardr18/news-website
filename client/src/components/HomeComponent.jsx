// // client/src/components/HomeComponent.jsx

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { toast } from 'react-toastify'; // NEW: Import toast here


// function HomeComponent() {
//   const [articles, setArticles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
// //   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');


//   // ----------------------------------------------------
//   // MOVE refreshArticles HERE from App.jsx
//   const refreshArticles = async (query = '') => {
//     setLoading(true);
//     setError(null);
//     try {
//       // NEW: Construct URL with query parameter if present
//     const url = query
//       ? `http://localhost:3000/api/articles?query=${encodeURIComponent(query)}`
//       : 'http://localhost:3000/api/articles';
//       // <--- USE the 'url' variable here
//     const response = await fetch(url);
//     if (!response.ok) {
//       // It's good to throw an error with more detail from the response
//       const errorData = await response.json();
//       throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     setArticles(data);
//   } catch (err) {
//     console.error("Failed to fetch articles:", err);
//     setError("Failed to load articles. Please try again later.");
//     toast.error(`Error loading articles: ${err.message}`); // Make sure this uses toast, not just setError
//   } finally {
//     setLoading(false);
//   }
//   };

//   // Corrected useEffect to trigger fetch with searchTerm
//   useEffect(() => {
//     refreshArticles(searchTerm); // <--- PASS searchTerm here
//   }, [searchTerm]); // This will re-run whenever searchTerm changes

//   // const response = await fetch('http://localhost:3000/api/articles');
//   //     if (!response.ok) {
//   //       throw new Error(`HTTP error! status: ${response.status}`);
//   //     }
//   //     const data = await response.json();
//   //     setArticles(data);
//   //   } catch (err) {
//   //     console.error("Failed to fetch articles:", err);
//   //     setError("Failed to load articles. Please try again later.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // // MOVE this useEffect HERE from App.jsx
//   // useEffect(() => {
//   //   refreshArticles();
//   // }, [searchTerm]); // Run once on mount
//   // // ----------------------------------------------------

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this article?")) {
//       try {
//         const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
//           method: 'DELETE',
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to delete article.');
//         }

//         refreshArticles(); // Refresh the list after deletion
//         alert("Article deleted successfully!");
//       } catch (err) {
//         console.error('Error deleting article:', err);
//         //alert(`Error deleting article: ${err.message}`);
//         toast.error(`Error deleting article: ${err.message}`); // NEW: Use toast.error

//       }
//     }
//   };

//   if (loading) {
//   return (
//       <div className="App"> {/* Ensure consistent App class for loading/error states */}
//         <h2>Loading news articles...</h2>
//       </div>
//     ); 
//    }

//   if (error) {
//     return (
//       <div className="App" style={{ color: 'red' }}> {/* Ensure consistent App class for loading/error states */}
//         <h2>Error: {error}</h2>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* <div style={{ textAlign: 'right', marginBottom: '20px' }}>
//         <Link to="/create-article" className="create-article-link">Create New Article</Link>
//       </div> */}
//       <div className="home-header">
//       <h1>Latest News</h1> {/* Changed from "News Articles" to "Latest News" for consistency with the H1 below */}
//       <Link to="/create-article" className="create-article-button">Create New Article</Link>
//     </div>

//     {/* NEW: Search Bar JSX */}
//     <div className="search-bar">
//       <input
//         type="text"
//         placeholder="Search articles by title, category, author..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="search-input"
//       />
//     </div>

//     {/* {loading && <p>Loading articles...</p>}
//     {error && <p style={{ color: 'red' }}>Error: {error}</p>} */}


//       {/* <h1>Latest News</h1> */}
//       <div className="articles-container">
//         {articles.length > 0 ? (
//           articles.map(article => (
//             <div key={article._id} className="article-card">
//               {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="article-image" />}
//               <h2>{article.title}</h2>
//               <p className="article-author-date">By {article.author} | {new Date(article.publishedDate).toLocaleDateString()}</p>
//               <p>{article.content.substring(0, 150)}...</p>
//               <span className="article-category">{article.category}</span>
//               <div className="article-actions">
//                 <Link to={`/article/${article._id}`} className="read-more">Read More</Link>
                
//                 {/* RE-ADD THIS EDIT LINK */}
//                 <Link to={`/edit-article/${article._id}`} className="edit-button">Edit</Link>

//                 <button onClick={() => handleDelete(article._id)} className="delete-button">Delete</button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>No news articles found.</p>
//         )}
//       </div>
//     </>
//   );
// }

// export default HomeComponent;


// client/src/components/HomeComponent.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';


function HomeComponent() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredArticles = articles.filter((article) =>
  article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
  article.category.toLowerCase().includes(searchTerm.toLowerCase())
);



  // Consolidated and Corrected refreshArticles function
  const refreshArticles = async (query = '') => { // <--- Correct: 'query' parameter is defined here
    setLoading(true);
    setError(null);
    try {
      // Correctly construct URL based on the 'query' parameter
      const url = query
        ? `http://localhost:3000/api/articles?query=${encodeURIComponent(query)}`
        : 'http://localhost:3000/api/articles';

      // <--- Correct: Using the constructed 'url' for the fetch call
      const response = await fetch(url);
      if (!response.ok) {
        // It's good to throw an error with more detail from the response
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("Failed to load articles. Please try again later.");
      toast.error(`Error loading articles: ${err.message}`); // Use toast.error for loading errors
    } finally {
      setLoading(false);
    }
  };

  // Corrected useEffect to trigger fetch with searchTerm
//   useEffect(() => {
//   const timeoutId = setTimeout(() => {
//     refreshArticles(searchTerm);
//   }, 500); // wait 500ms after user stops typing

//   return () => clearTimeout(timeoutId); // clean up on next keystroke
// }, [searchTerm]);

useEffect(() => {
  refreshArticles(); // no need to pass searchTerm
}, []);


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

        refreshArticles(searchTerm); // Refresh the list after deletion, maintaining current search
        toast.success("Article deleted successfully!"); // <--- Corrected to toast.success

      } catch (err) {
        console.error('Error deleting article:', err);
        toast.error(`Error deleting article: ${err.message}`);
      }
    }
  };

  // Ensure loading and error states are rendered within a div with the App class for consistent styling
  if (loading) {
    return (
      <div className="App">
        <h2>Loading news articles...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App" style={{ color: 'red' }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <>
      <div className="home-header">
        <h1>Latest News</h1> {/* Single H1 for the page */}
        <Link to="/create-article" className="create-article-button">Create New Article</Link>
      </div>

      {/* Search Bar JSX */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search articles by title, category, author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="articles-container">
        {filteredArticles.length > 0 ? (
  filteredArticles.map(article => (
    <div key={article._id} className="article-card">
      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} className="article-image" />
      )}
      <h2>{article.title}</h2>
      <p className="article-author-date">
        By {article.author} | {new Date(article.publishedDate).toLocaleDateString()}
      </p>
      <p>{article.content.substring(0, 150)}...</p>
      <span className="article-category">{article.category}</span>
      <div className="article-actions">
        <Link to={`/article/${article._id}`} className="read-more">Read More</Link>
        <Link to={`/edit-article/${article._id}`} className="edit-button">Edit</Link>
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