const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'waiter', 'cashier', 'kitchen', 'owner', 'admin'], default: 'customer' },
  status: { type: String, enum: ['VIP', 'Standard'], default: 'Standard' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  loyaltyPoints: { type: Number, default: 0, min: 0 },
  lifetimePoints: { type: Number, default: 0, min: 0 },
  loyaltyTier: { 
    type: String, 
    enum: ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'], 
    default: 'STANDARD' 
  }
}, { timestamps: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
