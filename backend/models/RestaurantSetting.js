const mongoose = require('mongoose');

const restaurantSettingSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'AURA Gastronomy Flagship' },
  baseUrl: { type: String, default: 'http://localhost:5173' },
  wifiSsid: { type: String, default: 'AURA-Guest-5G' },
  wifiPassword: { type: String, default: 'AuraDining2026' },
  taxRate: { type: Number, default: 5.0 },
  serviceCharge: { type: Number, default: 0.0 },
  currencySymbol: { type: String, default: '₹' },
  receiptFooter: { type: String, default: 'Thank you for dining at AURA. Atmospheric Perfection.' },
}, { timestamps: true });

module.exports = mongoose.model('RestaurantSetting', restaurantSettingSchema);
