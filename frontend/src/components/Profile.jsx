import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Profile({ currentUserId }) {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Get user info
        const userRes = await axios.get(`/api/users/${username}`);
        setUser(userRes.data.user);
        // Get posts
        const postsRes = await axios.get(`/api/posts`, { params: { user_id: userRes.data.user.id } });
        setPosts(postsRes.data.posts);
        // Get followers/following
        const followersRes = await axios.get(`/api/users/${username}/followers`);
        setFollowers(followersRes.data.followers);
        const followingRes = await axios.get(`/api/users/${username}/following`);
        setFollowing(followingRes.data.following);
        // Check if current user is following
        setIsFollowing(followersRes.data.followers.some(f => f.id === currentUserId));
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [username, currentUserId]);

  const handleFollow = async () => {
    try {
      await axios.post('/api/follow', { follower_id: currentUserId, following_id: user.id });
      setIsFollowing(true);
      setFollowers(prev => [...prev, { id: currentUserId }]);
    } catch (err) {}
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete('/api/unfollow', { data: { follower_id: currentUserId, following_id: user.id } });
      setIsFollowing(false);
      setFollowers(prev => prev.filter(f => f.id !== currentUserId));
    } catch (err) {}
  };

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded shadow p-6 mb-6 flex flex-col items-center">
        <img
          src={user.profile_image_url || 'https://ui-avatars.com/api/?name=' + user.username}
          alt={user.username}
          className="w-24 h-24 rounded-full mb-2"
        />
        <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
        <div className="text-gray-600 mb-2">{user.bio || 'No bio yet.'}</div>
        <div className="flex gap-6 mb-2">
          <div><span className="font-bold">{followers.length}</span> Followers</div>
          <div><span className="font-bold">{following.length}</span> Following</div>
        </div>
        {currentUserId !== user.id && (
          isFollowing ? (
            <button className="bg-gray-300 text-gray-700 px-4 py-1 rounded" onClick={handleUnfollow}>
              Unfollow
            </button>
          ) : (
            <button className="bg-indigo-600 text-white px-4 py-1 rounded" onClick={handleFollow}>
              Follow
            </button>
          )
        )}
      </div>
      <h3 className="text-xl font-bold mb-4">Posts</h3>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-gray-500">No posts yet.</div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded shadow p-4">
              <div className="mb-2">{post.content}</div>
              {post.rating !== null && (
                <div className="text-yellow-500 mb-1">{'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}</div>
              )}
              <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile; 