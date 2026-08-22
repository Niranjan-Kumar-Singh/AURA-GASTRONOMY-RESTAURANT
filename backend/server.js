require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const contentRoutes = require('./routes/contentRoutes');
const tableRoutes = require('./routes/tableRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
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
app.use('/api', chatbotRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('AURA API Server is running');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (accessible on LAN)`);
  });
}

module.exports = app;
