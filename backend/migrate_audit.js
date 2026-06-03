require('dotenv').config();
const mysql = require('mysql2/promise');

const migrate = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'kutuphane',
      port: process.env.DB_PORT || 3306,
    });

    console.log('🔌 Veritabanına bağlanıldı...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL DEFAULT 'system',
        target_id INT NULL,
        details JSON,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ audit_logs tablosu oluşturuldu (veya zaten vardı).');

    // Add index for faster queries
    try {
      await connection.query(`
        CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id)
      `);
      await connection.query(`
        CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at)
      `);
      console.log('✅ İndeksler oluşturuldu.');
    } catch (indexErr) {
      // Indexes may already exist — safe to ignore
      console.log('ℹ️  İndeksler zaten mevcut (atlandı).');
    }

    console.log('🎉 Migration tamamlandı!');
  } catch (err) {
    console.error('❌ Migration hatası:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

migrate();
