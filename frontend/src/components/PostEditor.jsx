import React, { useState } from 'react';
import axios from 'axios';

function PostEditor({ userId, bookId, onPost }) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!content || !bookId || !userId) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/posts', {
        user_id: userId,
        book_id: bookId,
        content,
        rating,
      });
      setContent('');
      setRating(0);
      setSuccess(true);
      if (onPost) onPost(res.data.post);
    } catch (err) {
      setError('Failed to post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Write a Post</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">Posted!</div>}
      <textarea
        className="w-full border rounded p-2 mb-3"
        rows={4}
        placeholder="Share your thoughts about this book..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div className="flex items-center gap-2 mb-3">
        <span>Rating:</span>
        {[1,2,3,4,5].map(star => (
          <button
            type="button"
            key={star}
            className={star <= rating ? 'text-yellow-500' : 'text-gray-400'}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}

export default PostEditor; 