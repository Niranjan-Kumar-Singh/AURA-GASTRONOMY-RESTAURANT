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

// Create Reservation
router.post('/reservations', async (req, res) => {
  try {
    const { userId, customerName, phone, email, date, time, partySize, specialRequests } = req.body;
    const reservation = await Reservation.create({
      userId, customerName, phone, email, date, time, partySize, specialRequests
    });
    res.status(201).json({ data: reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Wishlist
router.get('/users/:userId/wishlist', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle Wishlist Item
router.post('/users/:userId/wishlist/toggle', async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const itemIndex = user.wishlist.indexOf(itemId);
    if (itemIndex > -1) {
      // Remove
      user.wishlist.splice(itemIndex, 1);
    } else {
      // Add
      user.wishlist.push(itemId);
    }
    await user.save();
    
    // Return populated wishlist
    const populatedUser = await User.findById(req.params.userId).populate('wishlist');
    res.json({ data: populatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
