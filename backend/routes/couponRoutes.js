const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, requireRole, optionalAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// GET all coupons — Public gets active only; Staff gets all
router.get('/', optionalAuth, async (req, res) => {
  try {
    const isStaff = req.user && ['ADMIN', 'MANAGER', 'OWNER', 'CASHIER'].includes(req.user.role?.toUpperCase());
    const filter = isStaff ? {} : { isActive: true };
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /validate/:code — Validates code, active status, and minimum order threshold (Fix B4)
router.get('/validate/:code', async (req, res) => {
  try {
    const cleanCode = String(req.params.code || '').trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ success: false, message: `Coupon code "${cleanCode}" is invalid.` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: `Coupon "${cleanCode}" has expired or is deactivated.` });
    }

    // Server-side threshold verification if subtotal provided
    const subtotalParam = req.query.subtotal || req.query.amount;
    if (subtotalParam !== undefined) {
      const orderSubtotal = Number(subtotalParam);
      if (!isNaN(orderSubtotal) && coupon.minOrderAmount > 0 && orderSubtotal < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon ${cleanCode}. Current subtotal: ₹${orderSubtotal}.`
        });
      }
    }

    res.json({
      success: true,
      data: coupon,
      message: `Coupon "${coupon.code}" applied successfully! (₹${coupon.discountAmount} off)`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST / — Admin create new coupon (Fix E2)
router.post('/', protect, requireRole('ADMIN', 'MANAGER', 'OWNER'), async (req, res) => {
  try {
    const { code, title, discountAmount, minOrderAmount, description, isActive } = req.body;

    if (!code || !title || discountAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Coupon code, title, and discount amount are required.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" already exists.` });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      title: String(title).trim(),
      discountAmount: Number(discountAmount) || 0,
      minOrderAmount: Number(minOrderAmount) || 0,
      description: description ? String(description).trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    res.status(201).json({ success: true, data: newCoupon, message: 'Coupon created successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /:id — Admin update coupon (Fix E2)
router.put('/:id', protect, requireRole('ADMIN', 'MANAGER', 'OWNER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, discountAmount, minOrderAmount, description, isActive } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    if (code) {
      const cleanCode = String(code).trim().toUpperCase();
      if (cleanCode !== coupon.code) {
        const conflict = await Coupon.findOne({ code: cleanCode, _id: { $ne: id } });
        if (conflict) {
          return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" already in use.` });
        }
        coupon.code = cleanCode;
      }
    }

    if (title) coupon.title = String(title).trim();
    if (discountAmount !== undefined) coupon.discountAmount = Number(discountAmount);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (description !== undefined) coupon.description = String(description).trim();
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();
    res.json({ success: true, data: coupon, message: 'Coupon updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /:id — Admin delete coupon (Fix E2)
router.delete('/:id', protect, requireRole('ADMIN', 'MANAGER', 'OWNER'), async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    res.json({ success: true, message: `Coupon "${coupon.code}" deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
