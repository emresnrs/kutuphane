require('dotenv').config();
const mysql = require('mysql2/promise');

const migrate = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 3306,
    database: 'kutuphane',
  });

  console.log('Running admin migrations...');

  const alterStatements = [
    [`ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE`, 'users.is_banned'],
    [`ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'pending'`, 'orders.status'],
    [`ALTER TABLE orders ADD COLUMN payment_card_last4 VARCHAR(4) DEFAULT NULL`, 'orders.payment_card_last4'],
  ];

  for (const [sql, label] of alterStatements) {
    try {
      await connection.query(sql);
      console.log('✓ Added:', label);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⊙ Already exists:', label);
      } else {
        console.error('✗ Error on', label, ':', err.message);
      }
    }
  }

  console.log('Migration complete!');
  await connection.end();
};

migrate();
