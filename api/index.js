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

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AURA API Serverless backend is live' });
});

module.exports = app;
