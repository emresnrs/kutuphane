const pool = require('../db');
const bcrypt = require('bcrypt');
const { logAction, getIp } = require('../middleware/auditLog');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users WHERE is_admin = FALSE');
    const [[{ totalBooks }]] = await pool.query('SELECT COUNT(*) as totalBooks FROM books');
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalRevenue }]] = await pool.query('SELECT COALESCE(SUM(total_price), 0) as totalRevenue FROM orders');
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total_price, o.status, o.created_at, o.payment_card_last4,
              u.email, u.username
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    res.json({ totalUsers, totalBooks, totalOrders, totalRevenue, recentOrders });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error getting stats' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, email, username, is_admin, is_banned, profile_image, created_at FROM users';
    const params = [];

    if (search) {
      query += ' WHERE email LIKE ? OR username LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error getting users' });
  }
};

// PUT /api/admin/users/:id/ban
exports.toggleBan = async (req, res) => {
  try {
    const { id } = req.params;
    const [[user]] = await pool.query('SELECT id, email, username, is_banned FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    const newBanned = !user.is_banned;
    await pool.query('UPDATE users SET is_banned = ? WHERE id = ?', [newBanned, id]);

    await logAction(
      req.user.id,
      newBanned ? 'BAN_USER' : 'UNBAN_USER',
      'user',
      parseInt(id),
      { targetEmail: user.email, targetUsername: user.username, is_banned: newBanned },
      getIp(req)
    );

    res.json({ message: newBanned ? 'Kullanıcı yasaklandı' : 'Kullanıcı aktif edildi', is_banned: newBanned });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error toggling ban' });
  }
};

// PUT /api/admin/users/:id/role
exports.toggleAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Kendi rolünüzü değiştiremezsiniz' });
    }
    const [[user]] = await pool.query('SELECT id, email, username, is_admin FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    const newAdmin = !user.is_admin;
    await pool.query('UPDATE users SET is_admin = ? WHERE id = ?', [newAdmin, id]);

    await logAction(
      req.user.id,
      newAdmin ? 'GRANT_ADMIN' : 'REVOKE_ADMIN',
      'user',
      parseInt(id),
      { targetEmail: user.email, targetUsername: user.username, is_admin: newAdmin },
      getIp(req)
    );

    res.json({ message: newAdmin ? 'Admin yapıldı' : 'Admin rolü alındı', is_admin: newAdmin });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error toggling admin' });
  }
};

// PUT /api/admin/users/:id/password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
    }

    const [[user]] = await pool.query('SELECT id, email, username FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);

    await logAction(
      req.user.id,
      'CHANGE_PASSWORD',
      'user',
      parseInt(id),
      { targetEmail: user.email, targetUsername: user.username },
      getIp(req)
    );

    res.json({ message: 'Şifre güncellendi' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error changing password' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Kendinizi silemezsiniz' });
    }

    const [[user]] = await pool.query('SELECT id, email, username FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    await logAction(
      req.user.id,
      'DELETE_USER',
      'user',
      parseInt(id),
      { targetEmail: user.email, targetUsername: user.username },
      getIp(req)
    );

    res.json({ message: 'Kullanıcı silindi' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

// GET /api/admin/orders
exports.getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total_price, o.status, o.created_at, o.payment_card_last4,
              u.email, u.username, u.id as user_id
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    // Fetch items for each order
    for (let order of orders) {
      const [items] = await pool.query(
        `SELECT oi.quantity, b.title, b.price, b.image, b.author
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
    res.status(500).json({ error: 'Server error getting orders' });
  }
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz sipariş durumu' });
    }

    const [[order]] = await pool.query('SELECT id, status, total_price FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Sipariş bulunamadı' });

    await logAction(
      req.user.id,
      'UPDATE_ORDER_STATUS',
      'order',
      parseInt(id),
      { previousStatus: order.status, newStatus: status, totalPrice: order.total_price },
      getIp(req)
    );

    res.json({ message: 'Sipariş durumu güncellendi', status });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error updating order status' });
  }
};

// DELETE /api/admin/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [[order]] = await pool.query('SELECT id, total_price, status FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });

    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Sipariş bulunamadı' });

    await logAction(
      req.user.id,
      'DELETE_ORDER',
      'order',
      parseInt(id),
      { totalPrice: order.total_price, status: order.status },
      getIp(req)
    );

    res.json({ message: 'Sipariş silindi' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error deleting order' });
  }
};
