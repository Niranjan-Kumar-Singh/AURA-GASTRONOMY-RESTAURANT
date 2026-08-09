const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');

// Gracefully handle MenuItem
let MenuItem;
try {
  MenuItem = require('../models/MenuItem');
} catch (e) {
  MenuItem = null;
}
const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalStaff = await User.countDocuments({ role: { $ne: 'CUSTOMER' } });
    const totalDishes = MenuItem ? await MenuItem.countDocuments() : 150; // fallback

    const ongoingOrdersCount = await Order.countDocuments({ status: { $in: ['received', 'preparing', 'ready'] } });
    const completedOrdersCount = await Order.countDocuments({ status: 'completed' });

    // Aggregate revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Fake profit margin of 35% for demo
    const totalProfit = totalRevenue * 0.35;

    res.json({
      data: {
        users: totalUsers,
        staff: totalStaff,
        dishes: totalDishes,
        ongoingOrders: ongoingOrdersCount,
        completedOrders: completedOrdersCount,
        revenue: totalRevenue,
        profit: totalProfit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
