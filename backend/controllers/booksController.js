const pool = require('../db');

// GET /api/books — filtreleme & arama desteğiyle
exports.getAllBooks = async (req, res) => {
  try {
    const { search, category, subcategory, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = [];
    let params = [];

    if (search) {
      where.push('(title LIKE ? OR author LIKE ? OR publisher LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (subcategory) {
      where.push('subcategory = ?');
      params.push(subcategory);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM books ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM books ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ books: rows, total, page: parseInt(page), limit: parseInt(limit) });
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

// GET /api/books/categories — mevcut kategorileri listele
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT subcategory FROM books WHERE subcategory IS NOT NULL ORDER BY subcategory'
    );
    res.json(rows.map(r => r.subcategory));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error retrieving categories' });
  }
};

// POST /api/books
exports.createBook = async (req, res) => {
  try {
    const {
      title, author, publisher, price, stock, category, subcategory,
      image, product_url, description, page_count, publication_year, language, barcode
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO books
        (title, author, publisher, price, stock, category, subcategory,
         image, product_url, description, page_count, publication_year, language, barcode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, publisher, price, stock ?? 0, category, subcategory,
       image, product_url, description, page_count, publication_year, language, barcode]
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
    const {
      title, author, publisher, price, stock, category, subcategory,
      image, product_url, description, page_count, publication_year, language, barcode
    } = req.body;

    const [result] = await pool.query(
      `UPDATE books
       SET title=?, author=?, publisher=?, price=?, stock=?, category=?, subcategory=?,
           image=?, product_url=?, description=?, page_count=?, publication_year=?, language=?, barcode=?
       WHERE id = ?`,
      [title, author, publisher, price, stock, category, subcategory,
       image, product_url, description, page_count, publication_year, language, barcode, id]
    );

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
