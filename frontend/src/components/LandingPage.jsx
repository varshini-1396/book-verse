import React, { useState } from 'react';
import { User, Home, PlusCircle, Search, BookOpen, LogOut } from 'lucide-react';
import Feed from './Feed';
import PrivateNotes from './PrivateNotes';
import PostEditor from './PostEditor';
import BookSearch from './BookSearch';
import { useAuth } from '../App';

function Profile({ userId }) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center text-center">
          <img
            src="https://i.pravatar.cc/120?img=3"
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-indigo-200 shadow-lg mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alex Johnson</h2>
          <p className="text-gray-600 mb-4">Book enthusiast and avid reader</p>
          <div className="bg-gray-50 rounded-lg p-4 w-full max-w-md">
            <p className="text-sm text-gray-700 leading-relaxed">
              "I love discovering new worlds through books and sharing my thoughts with fellow readers. 
              Currently exploring science fiction and fantasy genres."
            </p>
          </div>
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">127</div>
              <div className="text-sm text-gray-500">Books Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">45</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">892</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const [activeView, setActiveView] = useState('feed');
  const { logout } = useAuth();
  const userId = 1;
  const bookId = 1;

  const navigationItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'post', label: 'Share a Post', icon: PlusCircle },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'notes', label: 'Personal Notes', icon: BookOpen },
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'profile':
        return <Profile userId={userId} />;
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
      case 'profile':
        return 'My Profile';
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
              <p className="text-sm font-medium text-gray-900 truncate">Alex Johnson</p>
              <p className="text-xs text-gray-500 truncate">alex.johnson@email.com</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
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
            onClick={logout}
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
                {activeView === 'profile' && 'Manage your reading profile and preferences'}
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