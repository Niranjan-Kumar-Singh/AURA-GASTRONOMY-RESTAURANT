require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../backend/config/db');
const menuRoutes = require('../backend/routes/menuRoutes');
const authRoutes = require('../backend/routes/authRoutes');
const orderRoutes = require('../backend/routes/orderRoutes');
const couponRoutes = require('../backend/routes/couponRoutes');
const contentRoutes = require('../backend/routes/contentRoutes');
const tableRoutes = require('../backend/routes/tableRoutes');
const adminRoutes = require('../backend/routes/adminRoutes');
const chatbotRoutes = require('../backend/routes/chatbotRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure DB connection is established before processing serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Serverless DB Middleware Error:', err.message);
    res.status(500).json({ message: 'Database connection failure', error: err.message });
  }
});

// API Routes
app.use('/api', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', chatbotRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AURA API Serverless backend is live' });
});

module.exports = app;
