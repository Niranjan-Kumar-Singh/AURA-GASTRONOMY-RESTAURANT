const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Generate a random order ID like ORD-4829
const generateOrderId = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

const TableSession = require('../models/TableSession');
const Table = require('../models/Table');

router.post('/', async (req, res) => {
  try {
    const { tableId, customerPhone, customerName, items, subtotal, tax, discount, total, appliedCoupon, sessionId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = await Order.create({
      orderId: generateOrderId(),
      tableId: tableId || '14', // Default for now
      customerPhone,
      customerName,
      items,
      subtotal,
      tax,
      discount,
      total,
      appliedCoupon,
      status: 'received'
    });

    // Link to session if sessionId is provided
    if (sessionId) {
      const session = await TableSession.findOne({ sessionId });
      if (session) {
        session.orders.push(order._id);
        await session.save();
      }
    } else {
      // Fallback: try to find an active session for the physical table
      const physicalTable = await Table.findOne({ tableNumber: tableId });
      if (physicalTable) {
        const session = await TableSession.findOne({ tableId: physicalTable._id, status: 'active' });
        if (session) {
          session.orders.push(order._id);
          await session.save();
        }
      }
    }

    res.status(201).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/phone/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ customerPhone: req.params.phone }).sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all orders for a specific table
router.get('/table/:tableId', async (req, res) => {
  try {
    const orders = await Order.find({ tableId: req.params.tableId }).sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active orders for Kitchen / Waiter / Cashier
router.get('/active/all', async (req, res) => {
  try {
    const activeOrders = await Order.find({
      status: { $in: ['received', 'preparing', 'ready', 'served'] }
    }).sort({ createdAt: 1 }); // Oldest first
    res.json({ data: activeOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Pay & Settle Table Bill
router.post('/pay-table', async (req, res) => {
  try {
    const { tableId, paymentMethod } = req.body;
    const identifier = String(tableId);

    const isValidObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const table = await Table.findOne({
      $or: [{ tableNumber: identifier }, { _id: isValidObjectId ? identifier : null }]
    });

    const queryId = table ? String(table.tableNumber) : identifier;

    // Find active orders for table
    const activeOrders = await Order.find({
      tableId: { $in: [queryId, identifier] },
      status: { $ne: 'cancelled' }
    });

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    for (const ord of activeOrders) {
      ord.status = 'completed';
      ord.paymentStatus = 'PAID';
      ord.paymentMethod = paymentMethod || 'UPI_QR';
      ord.paidAt = new Date();
      ord.invoiceNumber = invoiceNumber;
      await ord.save();
    }

    if (table) {
      const activeSession = await TableSession.findOne({ tableId: table._id, status: 'active' });
      if (activeSession) {
        activeSession.status = 'completed';
        activeSession.endTime = new Date();
        await activeSession.save();
      }

      table.status = 'cleaning';
      await table.save();
    }

    res.json({
      success: true,
      message: `Bill settled successfully via ${paymentMethod || 'UPI_QR'} for Table ${queryId}! Table set to Cleaning.`,
      data: { invoiceNumber, paymentMethod, paidAt: new Date() }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
