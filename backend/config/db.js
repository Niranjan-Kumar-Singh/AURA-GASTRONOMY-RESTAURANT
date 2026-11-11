const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Ensure environment variables are loaded from backend/.env or root .env
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env'),
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(process.cwd(), '.env'),
  ].forEach((envFile) => {
    if (fs.existsSync(envFile)) {
      try {
        require('dotenv').config({ path: envFile });
      } catch (e) {}
    }
  });
}

let cachedPromise = null;

/**
 * Connect to MongoDB with robust connection caching and Promise memoization.
 * Supports both persistent Express servers and serverless environments.
 */
const connectDB = async () => {
  // 1. If already fully connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If a connection attempt is already in flight, reuse the promise to prevent connection storms
  if (cachedPromise && mongoose.connection.readyState === 2) {
    return cachedPromise;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura_restaurant';

  cachedPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    })
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      console.error(`MongoDB Connection Error: ${error.message}`);
      throw error;
    });

  return cachedPromise;
};

module.exports = connectDB;
