const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const { requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', booksController.getAllBooks);
router.get('/categories/list', booksController.getCategories);
router.get('/:id', booksController.getBookById);

// Admin-only routes
router.post('/', requireAdmin, booksController.createBook);
router.put('/:id', requireAdmin, booksController.updateBook);
router.delete('/:id', requireAdmin, booksController.deleteBook);

module.exports = router;
