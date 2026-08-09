const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: Number, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  notes: { type: String },
  customizations: [{
    groupId: String,
    groupTitle: String,
    optionId: String,
    optionName: String,
    price: Number
  }]
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // e.g. ORD-1234
  tableId: { type: String, required: true },
  customerPhone: { type: String },
  customerName: { type: String },
  items: [orderItemSchema],
  status: { 
    type: String, 
    enum: ['received', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'received'
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  appliedCoupon: { type: String },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['UPI_QR', 'CARD_SWIPE', 'CASH', 'ONLINE'],
    default: 'CASH'
  },
  paidAt: { type: Date },
  invoiceNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
