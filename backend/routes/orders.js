const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');

// Protect order routes with authenticateToken
router.post('/', authenticateToken, ordersController.createOrder);
router.get('/', authenticateToken, ordersController.getUserOrders);
router.delete('/:id', authenticateToken, ordersController.cancelOrder);

module.exports = router;
