const pool = require('../db');

// GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { action, adminId } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (action) {
      where += ' AND al.action = ?';
      params.push(action);
    }
    if (adminId) {
      where += ' AND al.admin_id = ?';
      params.push(adminId);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs al ${where}`,
      params
    );

    const [logs] = await pool.query(
      `SELECT al.id, al.action, al.target_type, al.target_id,
              al.details, al.ip_address, al.created_at,
              u.email as admin_email, u.username as admin_username
       FROM audit_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Parse details JSON string if stored as string
    const formatted = logs.map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    }));

    res.json({
      logs: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching audit logs' });
  }
};

// DELETE /api/admin/audit-logs  — temizle (opsiyonel)
exports.clearAuditLogs = async (req, res) => {
  try {
    const { olderThanDays } = req.query;
    if (olderThanDays) {
      await pool.query(
        'DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [parseInt(olderThanDays)]
      );
      res.json({ message: `${olderThanDays} günden eski loglar silindi` });
    } else {
      await pool.query('TRUNCATE TABLE audit_logs');
      res.json({ message: 'Tüm audit loglar silindi' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error clearing audit logs' });
  }
};

// GET /api/admin/audit-logs/actions — distinct action types for filter
exports.getActionTypes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT action FROM audit_logs ORDER BY action ASC');
    res.json(rows.map(r => r.action));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching action types' });
  }
};
