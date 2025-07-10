import React, { useState } from 'react';
import { User, Home, PlusCircle, Search, BookOpen, LogOut } from 'lucide-react';
import Feed from './Feed';
import PrivateNotes from './PrivateNotes';
import PostEditor from './PostEditor';
import BookSearch from './BookSearch';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [activeView, setActiveView] = useState('feed');
  const { logout, user } = useAuth();
  console.log('Sidebar user:', user); // Debug log
  const navigate = useNavigate();
  const userId = 1;
  const bookId = 1;
  const username = user?.username;

  const navigationItems = [
    ...(username ? [{ id: 'profile', label: 'Profile', icon: User, path: `/profile/${username}` }] : []),
    { id: 'feed', label: 'Feed', icon: Home, path: '/feed' },
    { id: 'post', label: 'Share a Post', icon: PlusCircle, path: '/post' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'notes', label: 'Personal Notes', icon: BookOpen, path: '/notes' },
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'feed':
        return <Feed />;
      case 'post':
        return (
          <div className="max-w-2xl mx-auto py-8">
            <PostEditor userId={userId} bookId={bookId} />
          </div>
        );
      case 'search':
        return <BookSearch />;
      case 'notes':
        return <PrivateNotes userId={userId} />;
      default:
        return <Feed />;
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'feed':
        return 'Book Feed';
      case 'post':
        return 'Share Your Thoughts';
      case 'search':
        return 'Discover Books';
      case 'notes':
        return 'My Personal Notes';
      default:
        return 'Book Feed';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BookVerse</h1>
              <p className="text-sm text-gray-500">Your reading community</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/40?img=3"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  >
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {activeView === 'feed' && 'Discover what your community is reading'}
                {activeView === 'post' && 'Share your thoughts about books with the community'}
                {activeView === 'search' && 'Find your next great read'}
                {activeView === 'notes' && 'Keep track of your personal reading notes'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                <p className="text-xs text-gray-500">Ready to explore books?</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderMainContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;