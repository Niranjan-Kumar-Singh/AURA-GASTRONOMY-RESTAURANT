const express = require('express');
const Faq = require('../models/Faq');
const Gallery = require('../models/Gallery');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// Get FAQs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ data: faqs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Gallery
router.get('/gallery', async (req, res) => {
  try {
    const galleryItems = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ data: galleryItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const mongoose = require('mongoose');

// Create Reservation
router.post('/reservations', async (req, res) => {
  try {
    const { userId, customerName, phone, email, date, time, partySize, specialRequests } = req.body;
    if (!customerName || !phone || !date) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and reservation date are required.' });
    }

    const numParty = Math.max(1, Math.min(50, parseInt(partySize, 10) || 2));

    const reservation = await Reservation.create({
      userId: userId && mongoose.isValidObjectId(userId) ? userId : null,
      customerName: String(customerName).trim().slice(0, 100),
      phone: String(phone).trim().slice(0, 20),
      email: email ? String(email).trim().slice(0, 100) : '',
      date: String(date),
      time: String(time || '19:30'),
      partySize: numParty,
      specialRequests: specialRequests ? String(specialRequests).slice(0, 300) : ''
    });
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get User Wishlist
router.get('/users/:userId/wishlist', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user identifier format.' });
    }

    const user = await User.findById(userId).populate('wishlist');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle Wishlist Item
router.post('/users/:userId/wishlist/toggle', async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemId } = req.body;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user identifier format.' });
    }
    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Dish item identifier is required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.wishlist = user.wishlist || [];
    const itemIndex = user.wishlist.findIndex(id => String(id) === String(itemId));
    if (itemIndex > -1) {
      // Remove
      user.wishlist.splice(itemIndex, 1);
    } else {
      // Add
      user.wishlist.push(itemId);
    }
    await user.save();
    
    // Return populated wishlist
    const populatedUser = await User.findById(userId).populate('wishlist');
    res.json({ success: true, data: populatedUser.wishlist || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
