import React from 'react';
import Feed from './Feed';
import PrivateNotes from './PrivateNotes';
import PostEditor from './PostEditor';
import BookSearch from './BookSearch';

function LandingPage() {
  const userId = 1;
  const bookId = 1;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Sidebar */}
      <aside className="w-80 bg-white/90 border-r border-gray-200 p-6 flex flex-col gap-6 shadow-xl">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="https://i.pravatar.cc/100?img=3"
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-indigo-200 shadow"
          />
          <h2 className="mt-3 text-lg font-bold text-gray-800">Welcome, User!</h2>
          <p className="text-sm text-gray-500">Your personal reading space</p>
        </div>
        <hr className="my-2" />
        {/* Notes */}
        <div className="bg-indigo-50 rounded-xl p-4 shadow hover:shadow-md transition">
          <h3 className="font-semibold text-indigo-700 mb-2">Personal Notes</h3>
          <PrivateNotes userId={userId} />
        </div>
        {/* Post Editor */}
        <div className="bg-purple-50 rounded-xl p-4 shadow hover:shadow-md transition">
          <h3 className="font-semibold text-purple-700 mb-2">Share a Post</h3>
          <PostEditor userId={userId} bookId={bookId} />
        </div>
        {/* Book Search */}
        <div className="bg-pink-50 rounded-xl p-4 shadow hover:shadow-md transition">
          <h3 className="font-semibold text-pink-700 mb-2">Find Books</h3>
          <BookSearch />
        </div>
      </aside>
      {/* Main Feed */}
      <main className="flex-1 p-10">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 mb-6 py-4 px-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold text-indigo-800">Book Feed</h1>
        </div>
        <Feed />
      </main>
    </div>
  );
}

export default LandingPage; 