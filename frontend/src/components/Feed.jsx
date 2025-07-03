import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';

function Feed({ currentUserId = 1 }) {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef();
  const [likeLoading, setLikeLoading] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/posts', {
        params: cursor ? { cursor } : {},
      });
      setPosts(prev => [...prev, ...res.data.posts]);
      setCursor(res.data.nextCursor);
      setHasMore(!!res.data.nextCursor);
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMore]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!loader.current) return;
    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchPosts();
      }
    });
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [fetchPosts, hasMore, loading]);

  // Like/unlike logic
  const handleLike = async (post) => {
    setLikeLoading(l => ({ ...l, [post.id]: true }));
    try {
      if (post.likedByCurrentUser) {
        await axios.delete('/api/likes', { data: { user_id: currentUserId, post_id: post.id } });
        setPosts(posts => posts.map(p => p.id === post.id ? { ...p, likedByCurrentUser: false, likes: (p.likes || 1) - 1 } : p));
      } else {
        await axios.post('/api/likes', { user_id: currentUserId, post_id: post.id });
        setPosts(posts => posts.map(p => p.id === post.id ? { ...p, likedByCurrentUser: true, likes: (p.likes || 0) + 1 } : p));
      }
    } catch (err) {}
    setLikeLoading(l => ({ ...l, [post.id]: false }));
  };

  // Comment logic
  const handleCommentInput = (postId, value) => {
    setCommentInputs(inputs => ({ ...inputs, [postId]: value }));
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text) return;
    try {
      await axios.post('/api/comments', { user_id: currentUserId, post_id: postId, comment_text: text });
      setCommentInputs(inputs => ({ ...inputs, [postId]: '' }));
      fetchComments(postId);
    } catch (err) {}
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`/api/comments/${postId}`);
      setComments(c => ({ ...c, [postId]: res.data.comments }));
    } catch (err) {}
  };

  const handleShowComments = (postId) => {
    setShowComments(show => ({ ...show, [postId]: !show[postId] }));
    if (!comments[postId]) fetchComments(postId);
  };

  // Share logic (copy link)
  const handleShare = (postId) => {
    const url = window.location.origin + '/post/' + postId;
    navigator.clipboard.writeText(url);
    alert('Post link copied!');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Feed</h2>
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded shadow p-4 mb-4">
          <div className="font-bold mb-1">User {post.user_id} on Book {post.book_id}</div>
          <div className="mb-2">{post.content}</div>
          {post.rating !== null && (
            <div className="text-yellow-500 mb-1">{'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}</div>
          )}
          <div className="flex gap-4 items-center mb-2">
            <button
              className={`text-pink-600 ${post.likedByCurrentUser ? 'font-bold' : ''}`}
              onClick={() => handleLike(post)}
              disabled={likeLoading[post.id]}
            >
              ♥ Like {post.likes || 0}
            </button>
            <button className="text-blue-600" onClick={() => handleShowComments(post.id)}>
              💬 Comment
            </button>
            <button className="text-gray-600" onClick={() => handleShare(post.id)}>
              ↗ Share
            </button>
          </div>
          {showComments[post.id] && (
            <div className="bg-gray-50 rounded p-2 mt-2">
              <div className="mb-2">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={e => handleCommentInput(post.id, e.target.value)}
                  placeholder="Write a comment..."
                  className="border px-2 py-1 rounded w-3/4"
                />
                <button
                  className="ml-2 bg-indigo-600 text-white px-2 py-1 rounded"
                  onClick={() => handleAddComment(post.id)}
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {(comments[post.id] || []).map(comment => (
                  <div key={comment.id} className="text-sm bg-white rounded p-2 shadow mb-1">
                    <span className="font-bold">User {comment.user_id}:</span> {comment.comment_text}
                    <span className="text-xs text-gray-400 ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">{new Date(post.created_at).toLocaleString()}</div>
        </div>
      ))}
      <div ref={loader} className="h-8 flex items-center justify-center">
        {loading && <span>Loading...</span>}
        {!hasMore && <span className="text-gray-400">No more posts.</span>}
      </div>
    </div>
  );
}

export default Feed; 