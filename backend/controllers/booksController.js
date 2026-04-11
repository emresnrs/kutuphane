const pool = require('../db');

// GET /api/books
exports.getAllBooks = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error retrieving books' });
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error retrieving book' });
  }
};

// POST /api/books
exports.createBook = async (req, res) => {
  try {
    const { title, author, price, stock, category, image } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO books (title, author, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, price, stock, category, image]
    );
    
    const [newBook] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(newBook[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error creating book' });
  }
};

// PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, price, stock, category, image } = req.body;
    
    const updateQuery = `
      UPDATE books
      SET title = ?, author = ?, price = ?, stock = ?, category = ?, image = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(updateQuery, [title, author, price, stock, category, image, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const [updatedBook] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    res.json(updatedBook[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error updating book' });
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error deleting book' });
  }
};
