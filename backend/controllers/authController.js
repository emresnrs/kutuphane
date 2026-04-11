const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.register = async (req, res) => {
  try {
    const { email, password, is_admin } = req.body;

    // Check if user already exists
    const [userCheck] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userCheck.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)',
      [email, hashedPassword, is_admin || false]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        email,
        is_admin: is_admin || false
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [userResult] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userResult.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = userResult[0];

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};
