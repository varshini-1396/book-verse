require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 4000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express + PostgreSQL!');
});

// Example route to test DB connection
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    // Insert user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password_hash]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    // Find user by username or email
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [usernameOrEmail]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const user = userResult.rows[0];
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/books/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Missing search query (q).' });
  }
  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q,
        maxResults: 10,
      },
    });
    const books = (response.data.items || []).map(item => {
      const volume = item.volumeInfo;
      return {
        id: item.id,
        title: volume.title,
        authors: volume.authors || [],
        cover_image: volume.imageLinks?.thumbnail || null,
        description: volume.description || '',
      };
    });
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
});

app.post('/api/books', async (req, res) => {
  const { google_books_id, title, authors, cover_image_url, description } = req.body;
  if (!google_books_id || !title) {
    return res.status(400).json({ error: 'google_books_id and title are required.' });
  }
  try {
    // Check if book already exists
    const existing = await pool.query(
      'SELECT * FROM books WHERE google_books_id = $1',
      [google_books_id]
    );
    if (existing.rows.length > 0) {
      return res.status(200).json({ book: existing.rows[0], message: 'Book already exists.' });
    }
    // Insert new book
    const result = await pool.query(
      'INSERT INTO books (google_books_id, title, authors, cover_image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [google_books_id, title, authors, cover_image_url, description]
    );
    res.status(201).json({ book: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  const { user_id, book_id, content, rating } = req.body;
  if (!user_id || !book_id || !content) {
    return res.status(400).json({ error: 'user_id, book_id, and content are required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO posts (user_id, book_id, content, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, book_id, content, rating]
    );
    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/posts', async (req, res) => {
  const { cursor } = req.query;
  const limit = 10;
  try {
    let query = 'SELECT * FROM posts';
    let params = [];
    if (cursor) {
      query += ' WHERE id < $1';
      params.push(cursor);
    }
    query += ' ORDER BY id DESC LIMIT $2';
    params.push(limit);
    const result = await pool.query(query, params);
    const posts = result.rows;
    // Next cursor is the last post's id, or null if no more posts
    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;
    res.json({ posts, nextCursor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a note
app.post('/api/notes', async (req, res) => {
  const { user_id, book_id, note_content } = req.body;
  if (!user_id || !book_id || !note_content) {
    return res.status(400).json({ error: 'user_id, book_id, and note_content are required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO notes (user_id, book_id, note_content) VALUES ($1, $2, $3) RETURNING *',
      [user_id, book_id, note_content]
    );
    res.status(201).json({ note: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all notes for a user
app.get('/api/notes', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required.' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    res.json({ notes: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a note
app.put('/api/notes/:noteId', async (req, res) => {
  const { noteId } = req.params;
  const { note_content } = req.body;
  if (!note_content) {
    return res.status(400).json({ error: 'note_content is required.' });
  }
  try {
    const result = await pool.query(
      'UPDATE notes SET note_content = $1 WHERE id = $2 RETURNING *',
      [note_content, noteId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json({ note: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a note
app.delete('/api/notes/:noteId', async (req, res) => {
  const { noteId } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 RETURNING *',
      [noteId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a post
app.post('/api/likes', async (req, res) => {
  const { user_id, post_id } = req.body;
  if (!user_id || !post_id) {
    return res.status(400).json({ error: 'user_id and post_id are required.' });
  }
  try {
    // Prevent duplicate likes
    const existing = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
      [user_id, post_id]
    );
    if (existing.rows.length > 0) {
      return res.status(200).json({ message: 'Already liked.' });
    }
    const result = await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *',
      [user_id, post_id]
    );
    res.status(201).json({ like: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unlike a post
app.delete('/api/likes', async (req, res) => {
  const { user_id, post_id } = req.body;
  if (!user_id || !post_id) {
    return res.status(400).json({ error: 'user_id and post_id are required.' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *',
      [user_id, post_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Like not found.' });
    }
    res.json({ message: 'Unliked.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to post
app.post('/api/comments', async (req, res) => {
  const { user_id, post_id, comment_text } = req.body;
  if (!user_id || !post_id || !comment_text) {
    return res.status(400).json({ error: 'user_id, post_id, and comment_text are required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO comments (user_id, post_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
      [user_id, post_id, comment_text]
    );
    res.status(201).json({ comment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments for a post
app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
      [postId]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow a user
app.post('/api/follow', async (req, res) => {
  const { follower_id, following_id } = req.body;
  if (!follower_id || !following_id) {
    return res.status(400).json({ error: 'follower_id and following_id are required.' });
  }
  if (follower_id === following_id) {
    return res.status(400).json({ error: 'Cannot follow yourself.' });
  }
  try {
    // Prevent duplicate follows
    const existing = await pool.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
      [follower_id, following_id]
    );
    if (existing.rows.length > 0) {
      return res.status(200).json({ message: 'Already following.' });
    }
    const result = await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING *',
      [follower_id, following_id]
    );
    res.status(201).json({ follow: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfollow a user
app.delete('/api/unfollow', async (req, res) => {
  const { follower_id, following_id } = req.body;
  if (!follower_id || !following_id) {
    return res.status(400).json({ error: 'follower_id and following_id are required.' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING *',
      [follower_id, following_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Follow relationship not found.' });
    }
    res.json({ message: 'Unfollowed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List followers of a user
app.get('/api/users/:username/followers', async (req, res) => {
  const { username } = req.params;
  try {
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userId = userResult.rows[0].id;
    const result = await pool.query(
      'SELECT u.id, u.username, u.profile_image_url FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.following_id = $1',
      [userId]
    );
    res.json({ followers: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List following of a user
app.get('/api/users/:username/following', async (req, res) => {
  const { username } = req.params;
  try {
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userId = userResult.rows[0].id;
    const result = await pool.query(
      'SELECT u.id, u.username, u.profile_image_url FROM follows f JOIN users u ON f.following_id = u.id WHERE f.follower_id = $1',
      [userId]
    );
    res.json({ following: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 