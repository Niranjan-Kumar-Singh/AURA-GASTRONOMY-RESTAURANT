const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aura-secret-key-12345', {
    expiresIn: '30d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const user = await User.create({
      name,
      phone,
      password
      // status defaults to 'Standard' in the schema
    });

    res.status(201).json({
      data: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        status: user.status,
        token: generateToken(user._id),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginId = identifier || email || phone;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide email/phone and password' });
    }

    let user = await User.findOne({
      $or: [{ email: loginId.toLowerCase() }, { phone: loginId }]
    });

    // Auto-seed default staff accounts on first login attempt if DB doesn't have them
    if (!user && loginId.includes('@aura.com')) {
      let defaultRole = 'admin';
      let name = 'Staff Member';
      if (loginId.startsWith('chef')) { defaultRole = 'kitchen'; name = 'Executive Chef'; }
      else if (loginId.startsWith('waiter')) { defaultRole = 'waiter'; name = 'Head Waiter'; }
      else if (loginId.startsWith('cashier')) { defaultRole = 'cashier'; name = 'Senior Cashier'; }
      else if (loginId.startsWith('owner')) { defaultRole = 'owner'; name = 'Restaurant Owner'; }
      else if (loginId.startsWith('admin')) { defaultRole = 'admin'; name = 'System Administrator'; }

      user = await User.create({
        name,
        email: loginId.toLowerCase(),
        phone: `+447000${Math.floor(100000 + Math.random() * 900000)}`,
        password: password,
        role: defaultRole,
        status: 'VIP'
      });
    }

    if (user && (await user.matchPassword(password))) {
      // Normalize role casing for frontend
      let roleUpper = (user.role || 'ADMIN').toUpperCase();
      if (roleUpper === 'KITCHEN') roleUpper = 'CHEF';
      if (roleUpper === 'OWNER') roleUpper = 'RESTAURANT_OWNER';

      res.json({
        data: {
          token: generateToken(user._id),
          accessToken: generateToken(user._id),
          user: {
            _id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: roleUpper,
            status: user.status
          }
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials. Please check your email/phone and password.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { userId, name, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number already in use by another account' });
      }
      user.phone = phone;
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    res.json({
      data: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        status: user.status,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
