import React, { useState } from 'react';
import axios from 'axios';

function BookSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResults([]);
    try {
      const res = await axios.get('/api/books/search', { params: { q: query } });
      setResults(res.data.books);
    } catch (err) {
      setError('Failed to fetch books.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (book) => {
    setError('');
    try {
      const res = await axios.post('/api/books', {
        google_books_id: book.id,
        title: book.title,
        authors: book.authors,
        cover_image_url: book.cover_image,
        description: book.description,
      });
      setSavedId(book.id);
    } catch (err) {
      setError('Failed to save book.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for books..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map(book => (
          <div key={book.id} className="bg-white rounded shadow p-4 flex flex-col">
            {book.cover_image && (
              <img src={book.cover_image} alt={book.title} className="h-40 object-contain mb-2" />
            )}
            <h3 className="font-bold text-lg mb-1">{book.title}</h3>
            <div className="text-sm text-gray-600 mb-1">{book.authors?.join(', ')}</div>
            <div className="text-xs text-gray-500 mb-2 line-clamp-3">{book.description}</div>
            <button
              className={`mt-auto px-3 py-1 rounded ${savedId === book.id ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              onClick={() => handleSelect(book)}
              disabled={savedId === book.id}
            >
              {savedId === book.id ? 'Saved' : 'Select'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookSearch; 