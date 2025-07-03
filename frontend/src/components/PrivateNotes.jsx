import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PrivateNotes({ userId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ book_id: '', note_content: '' });
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/notes', { params: { user_id: userId } });
      setNotes(res.data.notes);
    } catch (err) {
      setError('Failed to fetch notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchNotes();
    // eslint-disable-next-line
  }, [userId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!newNote.book_id || !newNote.note_content) {
      setError('Book ID and note content required.');
      return;
    }
    try {
      await axios.post('/api/notes', { ...newNote, user_id: userId });
      setNewNote({ book_id: '', note_content: '' });
      fetchNotes();
    } catch (err) {
      setError('Failed to create note.');
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setEditContent(note.note_content);
  };

  const handleUpdate = async (noteId) => {
    setError('');
    try {
      await axios.put(`/api/notes/${noteId}`, { note_content: editContent });
      setEditingId(null);
      setEditContent('');
      fetchNotes();
    } catch (err) {
      setError('Failed to update note.');
    }
  };

  const handleDelete = async (noteId) => {
    setError('');
    try {
      await axios.delete(`/api/notes/${noteId}`);
      fetchNotes();
    } catch (err) {
      setError('Failed to delete note.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">My Private Notes</h2>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Book ID"
          value={newNote.book_id}
          onChange={e => setNewNote({ ...newNote, book_id: e.target.value })}
          className="border px-3 py-2 rounded w-32"
        />
        <input
          type="text"
          placeholder="Note content"
          value={newNote.note_content}
          onChange={e => setNewNote({ ...newNote, note_content: e.target.value })}
          className="flex-1 border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Add
        </button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center gap-2">
              <div className="font-bold text-sm w-24">Book {note.book_id}</div>
              {editingId === note.id ? (
                <>
                  <input
                    className="flex-1 border px-2 py-1 rounded"
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                  />
                  <button className="text-green-600" onClick={() => handleUpdate(note.id)}>Save</button>
                  <button className="text-gray-500" onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <div className="flex-1">{note.note_content}</div>
                  <button className="text-blue-600" onClick={() => handleEdit(note)}>Edit</button>
                  <button className="text-red-600" onClick={() => handleDelete(note.id)}>Delete</button>
                </>
              )}
              <div className="text-xs text-gray-400 ml-auto">{new Date(note.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PrivateNotes; 