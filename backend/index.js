require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Kutuphane API is running' });
});

// Import Routes
const authRoutes = require('./routes/auth.js');
const booksRoutes = require('./routes/books.js');
const ordersRoutes = require('./routes/orders.js');
const adminRoutes = require('./routes/admin.js');

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
