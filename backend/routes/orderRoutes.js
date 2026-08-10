const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const router = express.Router();

// Generate a random order ID like ORD-4829
const generateOrderId = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
const generateInvoiceNumber = () => `INV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

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

    // Automatically update physical table status to 'occupied' and link to active session
    const targetTableNum = String(tableId || '5');
    const physicalTable = await Table.findOne({
      $or: [{ tableNumber: targetTableNum }, { _id: targetTableNum.match(/^[0-9a-fA-F]{24}$/) ? targetTableNum : null }]
    });

    if (physicalTable) {
      if (physicalTable.status === 'available') {
        physicalTable.status = 'occupied';
      }
      
      let session = await TableSession.findOne({ tableId: physicalTable._id, status: 'active' });
      if (!session) {
        session = await TableSession.create({
          tableId: physicalTable._id,
          sessionId: `SESS-${Date.now().toString().slice(-6)}`,
          status: 'active',
          orders: [order._id]
        });
      } else {
        session.orders.push(order._id);
        await session.save();
      }
      await physicalTable.save();
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

// GET active orders for a specific table (excluding past settled orders)
router.get('/table/:tableId', async (req, res) => {
  try {
    const { includeCompleted } = req.query;
    const filter = { tableId: String(req.params.tableId) };
    
    if (includeCompleted !== 'true') {
      filter.status = { $in: ['received', 'preparing', 'ready', 'served'] };
      filter.paymentStatus = { $ne: 'PAID' };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active unpaid orders for Kitchen / Waiter / Cashier
router.get('/active/all', async (req, res) => {
  try {
    const activeOrders = await Order.find({
      status: { $in: ['received', 'preparing', 'ready', 'served'] },
      paymentStatus: { $ne: 'PAID' }
    }).sort({ createdAt: 1 }); // Oldest first
    res.json({ data: activeOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all settled/paid orders for Cashier POS & History Archive
router.get('/settled/all', async (req, res) => {
  try {
    const settledOrders = await Order.find({ paymentStatus: 'PAID' }).sort({ paidAt: -1, updatedAt: -1 });
    res.json({ data: settledOrders });
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

    const invoiceNumber = generateInvoiceNumber();

    for (const ord of activeOrders) {
      ord.status = 'completed';
      ord.paymentStatus = 'PAID';
      ord.paymentMethod = paymentMethod || 'UPI_QR';
      ord.paidAt = new Date();
      ord.invoiceNumber = invoiceNumber;
      await ord.save();
    }

    const matchedNum = identifier.match(/\d+/);
    const tableNumStr = matchedNum ? matchedNum[0] : identifier;

    await Table.updateMany(
      { $or: [{ tableNumber: tableNumStr }, { tableNumber: identifier }, { _id: isValidObjectId ? identifier : null }] },
      { $set: { status: 'cleaning', guestCount: 0 } }
    );

    if (table) {
      await TableSession.updateMany(
        { tableId: table._id, status: 'active' },
        { $set: { status: 'completed', endTime: new Date() } }
      ).catch(() => {});
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
