require('dotenv').config();
const mysql = require('mysql2/promise');

const initDB = async () => {
  try {
    console.log('Connecting to MySQL...');
    // Connect without specifying the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      port: process.env.DB_PORT || 3306,
    });

    console.log('Creating database kutuphane if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS kutuphane');
    await connection.query('USE kutuphane');

    console.log('Creating tables if they do not exist...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        username VARCHAR(255),
        password TEXT,
        profile_image LONGTEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500),
        author VARCHAR(255),
        publisher VARCHAR(255),
        price DECIMAL(10, 2),
        stock INT DEFAULT 0,
        category VARCHAR(255),
        subcategory VARCHAR(100),
        image TEXT,
        product_url TEXT,
        description LONGTEXT,
        page_count INT,
        publication_year INT,
        language VARCHAR(50),
        barcode VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        book_id INT,
        quantity INT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `);

    console.log('Database and tables created successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error creating database tables:', error);
  }
};

initDB();
