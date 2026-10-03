const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const { normalizePhoneQuery } = require('../utils/phoneUtils');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('[SECURITY] JWT_SECRET environment variable is not set.');
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    
    if (!name || typeof name !== 'string' || !phone || typeof phone !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Name, phone number, and password are required strings.' });
    }

    const cleanPhone = phone.trim();
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    const userExists = await User.findOne({ $or: normalizePhoneQuery(cleanPhone) });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this phone number already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      password,
      loyaltyPoints: 100, // 100 PTS Welcome Bonus
      lifetimePoints: 100,
      loyaltyTier: 'STANDARD'
    });

    // Record welcome bonus transaction in loyalty audit log
    await LoyaltyTransaction.create({
      userId: user._id,
      customerPhone: user.phone,
      type: 'WELCOME_BONUS',
      points: 100,
      balanceAfter: 100,
      description: 'AURA Club Welcome Dining Gift (+100 PTS)',
      metadata: { reason: 'New Account Registration' }
    }).catch(err => console.error('Failed to log welcome loyalty tx:', err));

    res.status(201).json({
      data: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: 'CUSTOMER',
        status: user.status || 'Standard',
        loyaltyPoints: user.loyaltyPoints,
        lifetimePoints: user.lifetimePoints,
        loyaltyTier: user.loyaltyTier,
        token: generateToken(user._id),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fast Mobile Number-Only Login for Dining Customers
router.post(['/phone-login', '/customer-quick-login'], async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    const rawInput = phone.trim().toLowerCase();
    const cleanDigits = rawInput.replace(/\D/g, '').slice(-10);

    // Block any attempt to use customer phone login for staff/admin accounts
    const staffKeywords = ['admin', 'owner', 'chef', 'kitchen', 'waiter', 'cashier'];
    const staffPhones = ['9999900001', '9999900002', '9999900003', '9999900004', '9999900005'];
    if (staffKeywords.includes(rawInput) || rawInput.includes('@') || staffPhones.includes(cleanDigits)) {
      return res.status(403).json({
        success: false,
        message: 'Staff and management accounts must authenticate securely via the Staff Login portal using their password.'
      });
    }

    if (cleanDigits.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid 10-digit mobile number (e.g. 9876543210).' 
      });
    }

    let user = await User.findOne({ 
      $or: [{ phone: cleanDigits }, { phone: `+91${cleanDigits}` }] 
    });

    if (user && user.role && user.role.toLowerCase() !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'This mobile number is registered to a staff account. Please sign in via the Staff Login page with your password.'
      });
    }

    let isNewUser = false;
    let welcomeBonus = 0;

    if (!user) {
      // Auto-create Customer account with 100 Welcome Points
      isNewUser = true;
      welcomeBonus = 100;
      const customerName = (name && typeof name === 'string' && name.trim()) 
        ? name.trim() 
        : `Diner-${cleanDigits.slice(-4)}`;

      user = await User.create({
        name: customerName,
        phone: cleanDigits,
        password: 'aura@' + cleanDigits,
        role: 'customer',
        status: 'Standard',
        loyaltyPoints: 100, // 100 PTS Welcome Gift
        lifetimePoints: 100,
        loyaltyTier: 'STANDARD'
      });

      // Record welcome bonus transaction in loyalty audit log
      await LoyaltyTransaction.create({
        userId: user._id,
        customerPhone: cleanDigits,
        type: 'WELCOME_BONUS',
        points: 100,
        balanceAfter: 100,
        description: 'AURA Club Welcome Dining Gift (+100 PTS)',
        metadata: { reason: 'Mobile Quick Login / Instant Enrollment' }
      }).catch(err => console.error('Failed to log welcome loyalty tx:', err));
    } else if (name && typeof name === 'string' && name.trim() && user.name.startsWith('Diner-')) {
      // Update temporary guest name if real name provided
      user.name = name.trim();
      await user.save();
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      data: {
        token,
        accessToken: token,
        isNewUser,
        welcomeBonus,
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: 'CUSTOMER',
          status: user.status || 'Standard',
          loyaltyPoints: user.loyaltyPoints || 0,
          lifetimePoints: user.lifetimePoints || 0,
          loyaltyTier: user.loyaltyTier || 'STANDARD'
        }
      }
    });
  } catch (error) {
    console.error('Phone login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Secure Staff & Customer Credentials Login (Password Required)
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginId = identifier || email || phone;

    if (!loginId || typeof loginId !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid credentials (email or phone).' });
    }

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Password is required to log in.' });
    }

    const cleanId = String(loginId).trim().toLowerCase();

    let user = await User.findOne({
      $or: [{ email: cleanId }, ...normalizePhoneQuery(loginId)]
    });

    // Staff accounts must be seeded into the DB manually via npm run seed or direct DB insertion.
    // Auto-creation with plaintext default passwords is a critical security risk and is disabled.
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    // Normalize role casing for frontend
    let roleUpper = (user.role || 'CUSTOMER').toUpperCase();
    if (roleUpper === 'KITCHEN') roleUpper = 'CHEF';
    if (roleUpper === 'OWNER') roleUpper = 'RESTAURANT_OWNER';

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        accessToken: token,
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: roleUpper,
          status: user.status,
          loyaltyPoints: user.loyaltyPoints || 0,
          lifetimePoints: user.lifetimePoints || 0,
          loyaltyTier: user.loyaltyTier || 'STANDARD'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update profile (Secured with JWT auth)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (phone && phone !== user.phone) {
      const cleanPhone = String(phone).trim();
      const phoneExists = await User.findOne({ $or: normalizePhoneQuery(cleanPhone), _id: { $ne: user._id } });
      if (phoneExists) {
        return res.status(400).json({ success: false, message: 'Phone number already in use by another account.' });
      }
      user.phone = cleanPhone;
    }

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        status: user.status,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
