require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'kutuphane',
    port: process.env.DB_PORT || 3306,
  });

  const alters = [
    'ALTER TABLE books MODIFY COLUMN title VARCHAR(500)',
    'ALTER TABLE books MODIFY COLUMN category VARCHAR(255)',
    'ALTER TABLE books ADD COLUMN publisher VARCHAR(255)',
    'ALTER TABLE books ADD COLUMN subcategory VARCHAR(100)',
    'ALTER TABLE books ADD COLUMN product_url TEXT',
    'ALTER TABLE books ADD COLUMN description LONGTEXT',
    'ALTER TABLE books ADD COLUMN page_count INT',
    'ALTER TABLE books ADD COLUMN publication_year INT',
    'ALTER TABLE books ADD COLUMN language VARCHAR(50)',
    'ALTER TABLE books ADD COLUMN barcode VARCHAR(50)',
  ];

  for (const sql of alters) {
    try {
      await c.query(sql);
      console.log('OK:', sql.substring(0, 70));
    } catch (e) {
      console.log('SKIP:', e.message.substring(0, 100));
    }
  }

  await c.end();
  console.log('\nMigration tamamlandı!');
}

migrate().catch(console.error);
