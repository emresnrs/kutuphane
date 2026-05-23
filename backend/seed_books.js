require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Fiyat string'ini sayıya çevir: "370,00 TL" => 370.00
function parsePrice(priceStr) {
  if (!priceStr) return null;
  // "1.292,00 TL" gibi formatlarda binlik nokta ve virgüllü ondalık var
  const cleaned = priceStr
    .replace(' TL', '')
    .replace(/\./g, '')   // binlik ayraçları sil
    .replace(',', '.');    // ondalık virgülü noktaya çevir
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

const seed = async () => {
  const jsonPath = path.join('C:', 'Users', 'esene', 'repos', 'crawl', 'kitaplar.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('kitaplar.json bulunamadı:', jsonPath);
    process.exit(1);
  }

  const books = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`${books.length} kitap bulundu, import ediliyor...`);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'kutuphane',
    port: process.env.DB_PORT || 3306,
  });

  // Mevcut kitapları temizle (isteğe bağlı — yorum satırına alabilirsin)
  await connection.query('DELETE FROM books');
  console.log('Mevcut kitaplar temizlendi.');

  let inserted = 0;
  let skipped = 0;

  for (const book of books) {
    const price = parsePrice(book.price);

    try {
      await connection.query(
        `INSERT INTO books
          (title, author, publisher, price, stock, category, subcategory,
           image, product_url, description, page_count, publication_year, language, barcode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          book.title || null,
          book.author || null,
          book.publisher || null,
          price,
          10, // varsayılan stok
          book.subcategory || book.category || null,
          book.subcategory || null,
          book.image_url || null,
          book.product_url || null,
          book.description || null,
          book.page_count || null,
          book.publication_year || null,
          book.language || null,
          book.barcode || null,
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`Hata (${book.title}):`, err.message);
      skipped++;
    }
  }

  await connection.end();
  console.log(`\n✅ Tamamlandı: ${inserted} eklendi, ${skipped} atlandı.`);
};

seed().catch(console.error);
