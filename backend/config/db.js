const mongoose = require('mongoose');
const dns = require('dns');

// Force Node to use Google's DNS to bypass local ISP SRV blocking
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://niranjansingh1419_db_user:tEP6hsSej6ODcDEr@cluster0.mdn2dez.mongodb.net/aura_restaurant?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
