require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

const createAdmin = async () => {
  const email = 'superadmin@kutuphane.com';
  const password = 'Admin123!';
  const username = 'SuperAdmin';

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    // Reset password and ensure admin
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await pool.query('UPDATE users SET is_admin = TRUE, password = ? WHERE email = ?', [hashed, email]);
    console.log('✓ Şifre sıfırlandı ve admin yapıldı');
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const [result] = await pool.query(
      'INSERT INTO users (email, password, username, is_admin) VALUES (?, ?, ?, ?)',
      [email, hashed, username, true]
    );
    console.log('✓ Admin hesabı oluşturuldu! ID:', result.insertId);
  }

  console.log('');
  console.log('  E-posta :', email);
  console.log('  Şifre   :', password);
  console.log('  URL     : http://localhost:3000/login');
  process.exit();
};

createAdmin().catch(err => { console.error(err); process.exit(1); });
