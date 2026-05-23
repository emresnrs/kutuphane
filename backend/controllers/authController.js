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
        username: null,
        is_admin: is_admin || false,
        profile_image: null
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
        username: user.username,
        is_admin: user.is_admin,
        profile_image: user.profile_image
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { currentPassword, newPassword, profileImage, username } = req.body;
    const userId = req.user.id;

    // Fetch user
    const [userResult] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult[0];

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Mevcut şifre hatalı' });
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    }

    // If profile image is provided
    if (profileImage !== undefined) {
      await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [profileImage, userId]);
    }

    // If username is provided
    if (username !== undefined) {
      await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
    }

    // Fetch updated user to return
    const [updatedUserResult] = await pool.query('SELECT id, email, username, is_admin, profile_image FROM users WHERE id = ?', [userId]);
    
    res.json({
      message: 'Profil güncellendi',
      user: updatedUserResult[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during profile update' });
  }
};
