const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aura-secret-key-12345', {
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

    const userExists = await User.findOne({ phone: cleanPhone });
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

// Fast Mobile / Number-Only Login for Customers, Staff, and Owners
router.post(['/phone-login', '/customer-quick-login'], async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid mobile number or staff code.' });
    }

    const rawInput = phone.trim().toLowerCase();

    // 1. Staff quick shortcuts and designated staff numbers
    const staffShortcuts = {
      owner: { role: 'owner', name: 'Restaurant Owner', email: 'owner@aura.com', phone: '9999900001' },
      admin: { role: 'admin', name: 'System Administrator', email: 'admin@aura.com', phone: '9999900002' },
      chef: { role: 'kitchen', name: 'Executive Chef', email: 'chef@aura.com', phone: '9999900003' },
      kitchen: { role: 'kitchen', name: 'Executive Chef', email: 'chef@aura.com', phone: '9999900003' },
      waiter: { role: 'waiter', name: 'Head Waiter', email: 'waiter@aura.com', phone: '9999900004' },
      cashier: { role: 'cashier', name: 'Senior Cashier', email: 'cashier@aura.com', phone: '9999900005' },
    };

    const staffPhoneMap = {
      '9999900001': staffShortcuts.owner,
      '9999900002': staffShortcuts.admin,
      '9999900003': staffShortcuts.chef,
      '9999900004': staffShortcuts.waiter,
      '9999900005': staffShortcuts.cashier,
    };

    const cleanDigits = rawInput.replace(/\D/g, '').slice(-10);
    const targetStaff = staffShortcuts[rawInput] || (cleanDigits ? staffPhoneMap[cleanDigits] : null);

    let user;
    let isNewUser = false;
    let welcomeBonus = 0;

    if (targetStaff) {
      // Find or upsert designated staff user
      user = await User.findOne({
        $or: [{ email: targetStaff.email }, { phone: targetStaff.phone }]
      });

      if (!user) {
        user = await User.create({
          name: targetStaff.name,
          email: targetStaff.email,
          phone: targetStaff.phone,
          password: 'staffpassword123',
          role: targetStaff.role,
          status: 'VIP'
        });
      }
    } else {
      // It is a customer phone number (or registered staff phone)
      if (cleanDigits.length !== 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please enter a valid 10-digit mobile number (e.g. 9876543210).' 
        });
      }

      user = await User.findOne({ 
        $or: [{ phone: cleanDigits }, { phone: `+91${cleanDigits}` }] 
      });

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
    }

    // Role normalization for frontend
    let roleUpper = (user.role || 'CUSTOMER').toUpperCase();
    if (roleUpper === 'KITCHEN') roleUpper = 'CHEF';
    if (roleUpper === 'OWNER') roleUpper = 'RESTAURANT_OWNER';

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
          role: roleUpper,
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

router.post('/login', async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginId = identifier || email || phone;

    if (!loginId || typeof loginId !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid credentials (phone or email).' });
    }

    // If password is not provided or empty, route through seamless phone-login
    if (!password) {
      req.body.phone = loginId;
      // Forward to phone login logic
      const cleanDigits = String(loginId).trim().replace(/\D/g, '').slice(-10);
      let user = await User.findOne({ $or: [{ phone: cleanDigits }, { email: String(loginId).trim().toLowerCase() }] });
      if (user) {
        let roleUpper = (user.role || 'CUSTOMER').toUpperCase();
        if (roleUpper === 'KITCHEN') roleUpper = 'CHEF';
        if (roleUpper === 'OWNER') roleUpper = 'RESTAURANT_OWNER';

        const token = generateToken(user._id);
        return res.json({
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
      }
    }

    const cleanId = String(loginId).trim().toLowerCase();

    let user = await User.findOne({
      $or: [{ email: cleanId }, { phone: loginId }]
    });

    // Auto-seed or sync default staff accounts on login attempt
    if (cleanId.includes('aura.com') || cleanId.startsWith('chef') || cleanId.startsWith('waiter') || cleanId.startsWith('cashier') || cleanId.startsWith('owner') || cleanId.startsWith('admin')) {
      let defaultRole = 'admin';
      let name = 'Staff Member';
      if (cleanId.includes('chef')) { defaultRole = 'kitchen'; name = 'Executive Chef'; }
      else if (cleanId.includes('waiter')) { defaultRole = 'waiter'; name = 'Head Waiter'; }
      else if (cleanId.includes('cashier')) { defaultRole = 'cashier'; name = 'Senior Cashier'; }
      else if (cleanId.includes('owner')) { defaultRole = 'owner'; name = 'Restaurant Owner'; }
      else if (cleanId.includes('admin')) { defaultRole = 'admin'; name = 'System Administrator'; }

      const emailToUse = cleanId.includes('@') ? cleanId : `${cleanId}@aura.com`;

      if (!user) {
        user = await User.findOne({ email: emailToUse });
      }

      if (!user) {
        user = await User.create({
          name,
          email: emailToUse,
          phone: `+91987${Math.floor(1000000 + Math.random() * 9000000)}`,
          password: password,
          role: defaultRole,
          status: 'VIP'
        });
      } else {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          user.password = password;
          user.role = defaultRole;
          await user.save();
        }
      }
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
            status: user.status,
            loyaltyPoints: user.loyaltyPoints || 0,
            lifetimePoints: user.lifetimePoints || 0,
            loyaltyTier: user.loyaltyTier || 'STANDARD'
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
