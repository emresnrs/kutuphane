const pool = require('../db');

/**
 * Logs an admin action to the audit_logs table.
 *
 * @param {number|null} adminId - ID of the admin performing the action
 * @param {string} action - Action code e.g. 'BAN_USER', 'DELETE_ORDER'
 * @param {string} targetType - 'user' | 'order' | 'book' | 'system'
 * @param {number|null} targetId - ID of the affected resource
 * @param {object} details - Arbitrary extra details (stored as JSON)
 * @param {string|null} ipAddress - IP address of the request
 */
const logAction = async (adminId, action, targetType, targetId, details = {}, ipAddress = null) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId ?? null, action, targetType, targetId ?? null, JSON.stringify(details), ipAddress]
    );
  } catch (err) {
    // Audit log failure should never crash the main request
    console.error('[AuditLog] Failed to write log:', err.message);
  }
};

/**
 * Express middleware factory — call this after a successful action.
 * Usage: after await pool.query(...) succeeds, call logAction(...).
 */
const getIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  );
};

module.exports = { logAction, getIp };
