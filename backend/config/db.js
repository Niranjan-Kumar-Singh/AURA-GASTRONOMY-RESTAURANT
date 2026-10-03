const mongoose = require('mongoose');

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
