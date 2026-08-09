const express = require('express');
const Coupon = require('../models/Coupon');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json({ data: coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/validate/:code', async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    res.json({ data: coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
