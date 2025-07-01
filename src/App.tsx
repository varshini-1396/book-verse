import React, { useState } from 'react';
import { Book, Plus, Search, Heart, Star, BookOpen } from 'lucide-react';

interface BookType {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: 'reading' | 'completed' | 'want-to-read';
  progress: number;
  rating?: number;
  cover?: string;
  dateAdded: string;
}

const sampleBooks: BookType[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    status: 'completed',
    progress: 100,
    rating: 5,
    dateAdded: '2024-01-15'
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    status: 'reading',
    progress: 65,
    rating: 4,
    dateAdded: '2024-01-10'
  },
  {
    id: '3',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: 'Science Fiction',
    status: 'want-to-read',
    progress: 0,
    dateAdded: '2024-01-20'
  }
];

function BookCard({ book }: { book: BookType }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'reading': return 'bg-blue-100 text-blue-800';
      case 'want-to-read': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'reading': return 'Reading';
      case 'want-to-read': return 'Want to Read';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Book className="w-8 h-8 text-white" />
        </div>
        <Heart className="w-5 h-5 text-gray-300 hover:text-red-500 cursor-pointer transition-colors" />
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
      <p className="text-sm text-gray-600 mb-3">by {book.author}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
          {getStatusText(book.status)}
        </span>
        <span className="text-xs text-gray-500">{book.genre}</span>
      </div>
      
      {book.status === 'reading' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{book.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${book.progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {book.rating && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < book.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddBookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter book title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter author name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">Select genre</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Self-Help">Self-Help</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="want-to-read">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [books] = useState<BookType[]>(sampleBooks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BookVault</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                />
              </div>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Book
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{books.length}</p>
              </div>
              <Book className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently Reading</p>
                <p className="text-2xl font-bold text-gray-900">
                  {books.filter(b => b.status === 'reading').length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {books.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            My Library ({filteredBooks.length} books)
          </h2>
          
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No books found. Add your first book to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Book Modal */}
      <AddBookModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

export default App;