const pool = require('../db');

// POST /api/orders
exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { total_price, items } = req.body;
    const user_id = req.user.id;
    
    // Start transaction
    await connection.beginTransaction();
    
    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
      [user_id, total_price]
    );
    
    const orderId = orderResult.insertId;
    
    // Create order items
    for (let item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, book_id, quantity) VALUES (?, ?, ?)',
        [orderId, item.book_id, item.quantity]
      );
    }
    
    // Commit transaction
    await connection.commit();
    
    const [newOrder] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    
    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder[0]
    });
  } catch (err) {
    await connection.rollback();
    console.error(err.message);
    res.status(500).json({ error: 'Server error creating order' });
  } finally {
    connection.release();
  }
};

// GET /api/orders
exports.getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    
    // Fetch items for each order
    for (let order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, b.title, b.price, b.image 
         FROM order_items oi 
         JOIN books b ON oi.book_id = b.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error retrieving orders' });
  }
};

// DELETE /api/orders/:id
exports.cancelOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    const order_id = req.params.id;

    // Check if order exists and belongs to the user
    const [orderCheck] = await pool.query('SELECT id FROM orders WHERE id = ? AND user_id = ?', [order_id, user_id]);
    
    if (orderCheck.length === 0) {
      return res.status(404).json({ error: 'Sipariş bulunamadı veya bu işlem için yetkiniz yok.' });
    }

    // Delete the order (order_items will be deleted automatically due to ON DELETE CASCADE)
    await pool.query('DELETE FROM orders WHERE id = ?', [order_id]);

    res.json({ message: 'Sipariş başarıyla iptal edildi.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error cancelling order' });
  }
};
