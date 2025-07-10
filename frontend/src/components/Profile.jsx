import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../App';

function Profile() {
  const { username } = useParams();
  const { user: currentUser, login } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Get user info
        const userRes = await axios.get(`/api/users/${username}`);
        setUser(userRes.data.user);
        setEditBio(userRes.data.user.bio || '');
        setEditProfileImage(userRes.data.user.profile_image_url || '');
        // Get posts
        const postsRes = await axios.get(`/api/posts`, { params: { user_id: userRes.data.user.id } });
        setPosts(postsRes.data.posts);
        // Get followers/following
        const followersRes = await axios.get(`/api/users/${username}/followers`);
        setFollowers(followersRes.data.followers);
        const followingRes = await axios.get(`/api/users/${username}/following`);
        setFollowing(followingRes.data.following);
        // Check if current user is following
        setIsFollowing(followersRes.data.followers.some(f => f.id === currentUser?.id));
      } catch (err) {
        setError('Failed to load profile: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [username, currentUser?.id]);

  const handleFollow = async () => {
    try {
      await axios.post('/api/follow', { follower_id: currentUser.id, following_id: user.id });
      setIsFollowing(true);
      setFollowers(prev => [...prev, { id: currentUser.id, username: currentUser.username }]);
    } catch (err) {}
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete('/api/unfollow', { data: { follower_id: currentUser.id, following_id: user.id } });
      setIsFollowing(false);
      setFollowers(prev => prev.filter(f => f.id !== currentUser.id));
    } catch (err) {}
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${user.username}`, {
        bio: editBio,
        profile_image_url: editProfileImage,
      });
      setUser({ ...user, bio: editBio, profile_image_url: editProfileImage });
      // Update context/localStorage if editing own profile
      if (isOwnProfile) {
        const updatedUser = { ...currentUser, bio: editBio, profile_image_url: editProfileImage };
        login(currentUser.token, updatedUser);
      }
      setShowEditModal(false);
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Profile Header */}
      <div className="bg-white rounded shadow p-6 mb-6 flex flex-col items-center">
        <img
          src={user.profile_image_url || 'https://ui-avatars.com/api/?name=' + user.username}
          alt={user.username}
          className="w-24 h-24 rounded-full mb-2 object-cover"
        />
        <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
        <div className="text-gray-600 mb-2">{user.bio || 'No bio yet.'}</div>
        <div className="flex gap-8 mb-2">
          <button onClick={() => setShowFollowersModal(true)} className="text-center focus:outline-none">
            <div className="text-xl font-bold text-indigo-600">{followers.length}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </button>
          <button onClick={() => setShowFollowingModal(true)} className="text-center focus:outline-none">
            <div className="text-xl font-bold text-indigo-600">{following.length}</div>
            <div className="text-sm text-gray-500">Following</div>
          </button>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-600">{posts.length}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
        </div>
        {isOwnProfile ? (
          <button className="bg-indigo-600 text-white px-4 py-1 rounded mt-2" onClick={() => setShowEditModal(true)}>
            Edit Profile
          </button>
        ) : (
          isFollowing ? (
            <button className="bg-gray-300 text-gray-700 px-4 py-1 rounded mt-2" onClick={handleUnfollow}>
              Unfollow
            </button>
          ) : (
            <button className="bg-indigo-600 text-white px-4 py-1 rounded mt-2" onClick={handleFollow}>
              Follow
            </button>
          )
        )}
      </div>

      {/* Posts Grid */}
      <h3 className="text-xl font-bold mb-4">Posts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.length === 0 ? (
          <div className="text-gray-500 col-span-full">No posts yet.</div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
              {/* You can add book cover or post image here if available */}
              <div className="mb-2 font-semibold text-center">{post.content}</div>
              {post.rating !== null && (
                <div className="text-yellow-500 mb-1">{'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}</div>
              )}
              <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={editProfileImage}
                  onChange={e => setEditProfileImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Followers</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {followers.length === 0 ? (
                <li className="text-gray-500">No followers yet.</li>
              ) : (
                followers.map(f => (
                  <li key={f.id} className="text-gray-900">@{f.username}</li>
                ))
              )}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded"
              onClick={() => setShowFollowersModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Following</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {following.length === 0 ? (
                <li className="text-gray-500">Not following anyone yet.</li>
              ) : (
                following.map(f => (
                  <li key={f.id} className="text-gray-900">@{f.username}</li>
                ))
              )}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded"
              onClick={() => setShowFollowingModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile; 