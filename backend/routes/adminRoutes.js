const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalStaff = await User.countDocuments({ role: { $ne: 'CUSTOMER' } });
    const totalDishes = await MenuItem.countDocuments();

    // Ongoing orders: active dining tickets not yet paid
    const ongoingOrdersCount = await Order.countDocuments({
      status: { $in: ['received', 'preparing', 'ready', 'served'] },
      paymentStatus: { $ne: 'PAID' }
    });

    // Completed orders: settled bills
    const completedOrdersCount = await Order.countDocuments({
      $or: [{ status: 'completed' }, { paymentStatus: 'PAID' }]
    });

    // Aggregate exact revenue from settled bills
    const revenueResult = await Order.aggregate([
      { $match: { $or: [{ status: 'completed' }, { paymentStatus: 'PAID' }] } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const totalProfit = totalRevenue * 0.35; // 35% gross profit margin

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
