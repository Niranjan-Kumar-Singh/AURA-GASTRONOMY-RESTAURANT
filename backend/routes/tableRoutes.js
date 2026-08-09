const express = require('express');
const crypto = require('crypto');
const Table = require('../models/Table');
const TableSession = require('../models/TableSession');
const Order = require('../models/Order');
const router = express.Router();

// Helper to generate unique session ID
const generateSessionId = () => `SESS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// Seed a table for testing if it doesn't exist (temporary utility)
router.post('/seed/:tableNumber', async (req, res) => {
  try {
    let table = await Table.findOne({ tableNumber: req.params.tableNumber });
    if (!table) {
      table = await Table.create({
        tableNumber: req.params.tableNumber,
        qrToken: crypto.randomBytes(16).toString('hex'),
      });
    }
    res.json({ data: table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DEV MODE ONLY: Seed and return session without checking token
router.post('/dev-seed', async (req, res) => {
  try {
    const { tableNumber, userId } = req.body;
    let table = await Table.findOne({ tableNumber });
    if (!table) {
      table = await Table.create({
        tableNumber,
        qrToken: crypto.randomBytes(16).toString('hex'),
      });
    }

    let session = await TableSession.findOne({ tableId: table._id, status: 'active' }).populate('users');
    
    if (!session) {
      session = await TableSession.create({
        tableId: table._id,
        sessionId: generateSessionId(),
        users: userId ? [userId] : [],
      });
      table.status = 'occupied';
      await table.save();
    } else {
      if (userId && !session.users.some(u => u._id.toString() === userId || u.toString() === userId)) {
        session.users.push(userId);
        await session.save();
      }
    }

    res.json({ data: { tableNumber: table.tableNumber, session, table } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all tables (For Waiter Dashboard - Ensures all 30 tables exist)
router.get('/', async (req, res) => {
  try {
    let tables = await Table.find().sort({ tableNumber: 1 });
    
    // Auto-seed tables 1 through 30 if database has fewer than 30 tables
    if (tables.length < 30) {
      const existingNumbers = new Set(tables.map(t => Number(t.tableNumber)));
      const tablesToCreate = [];

      for (let i = 1; i <= 30; i++) {
        if (!existingNumbers.has(i)) {
          tablesToCreate.push({
            tableNumber: String(i),
            capacity: i % 4 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
            status: 'available',
            qrToken: crypto.randomBytes(16).toString('hex'),
          });
        }
      }

      if (tablesToCreate.length > 0) {
        await Table.insertMany(tablesToCreate);
        tables = await Table.find().sort({ tableNumber: 1 });
      }
    }

    // For each table, attach active session details
    const tablesWithSessions = await Promise.all(tables.map(async (table) => {
      const activeSession = await TableSession.findOne({ tableId: table._id, status: 'active' }).populate('orders');
      
      let orderTotal = 0;
      let guestCount = 0;
      let activeOrderId = null;

      if (activeSession && table.status !== 'available' && table.status !== 'cleaning') {
        guestCount = table.guestCount || activeSession.users.length;
        if (activeSession.orders && activeSession.orders.length > 0) {
          activeOrderId = activeSession.orders[activeSession.orders.length - 1].orderId;
          orderTotal = activeSession.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        }
      } else {
        guestCount = (table.status === 'available' || table.status === 'cleaning') ? 0 : (table.guestCount || 0);
      }

      return {
        _id: table._id,
        tableNumber: Number(table.tableNumber),
        status: table.status,
        capacity: table.capacity || 4,
        activeOrderId: (table.status === 'available' || table.status === 'cleaning') ? null : activeOrderId,
        orderTotal: (table.status === 'available' || table.status === 'cleaning') ? 0 : orderTotal,
        guestCount
      };
    }));
    res.json({ data: tablesWithSessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate QR Code Token and retrieve/create an active session
router.post('/validate', async (req, res) => {
  try {
    const { tableNumber, token, userId } = req.body;
    
    // Find the physical table
    const table = await Table.findOne({ tableNumber });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Verify token matches the table's QR token
    if (table.qrToken !== token) {
      return res.status(401).json({ message: 'Invalid QR Code for this table.' });
    }

    // Check if there is an active session for this table
    let session = await TableSession.findOne({ tableId: table._id, status: 'active' }).populate('users');
    
    if (!session) {
      // Create a new session
      session = await TableSession.create({
        tableId: table._id,
        sessionId: generateSessionId(),
        users: userId ? [userId] : [],
      });
      table.status = 'occupied';
      await table.save();
    } else {
      // If user is not already in the session, add them
      if (userId && !session.users.some(u => u._id.toString() === userId || u.toString() === userId)) {
        session.users.push(userId);
        await session.save();
      }
    }

    res.json({ data: { tableNumber: table.tableNumber, session } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Session details (including orders)
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await TableSession.findOne({ sessionId: req.params.sessionId })
      .populate('orders')
      .populate('users', 'name phone');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ data: session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Checkout / Request Bill
router.post(['/checkout', '/session/:sessionId/checkout'], async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.body.sessionId;
    const { tableNumber, tableId } = req.body;
    const identifier = String(tableNumber || tableId || '10');

    // Find physical table
    const isValidObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const table = await Table.findOne({
      $or: [{ tableNumber: identifier }, { _id: isValidObjectId ? identifier : null }]
    });

    // Find orders for this table
    const tableQueryId = table ? String(table.tableNumber) : identifier;
    const allTableOrders = await Order.find({
      $or: [{ tableId: tableQueryId }, { tableId: identifier }]
    });

    if (allTableOrders.length === 0) {
      return res.status(400).json({
        message: `No active orders found for Table ${tableQueryId}. Please place an order first before requesting the bill.`
      });
    }

    // Check if any order is still being prepared or waiting in kitchen
    const pendingOrders = allTableOrders.filter((ord) => ['received', 'preparing', 'ready'].includes(ord.status));

    if (pendingOrders.length > 0) {
      return res.status(400).json({
        message: `Cannot request final bill yet! You have ${pendingOrders.length} order(s) still being prepared in the kitchen. Please wait until your food is served.`
      });
    }

    // If all orders are served/completed, calculate final total & set table status to billing
    const finalTotal = allTableOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

    if (table) {
      table.status = 'billing';
      await table.save();
    }

    let session = null;
    if (table) {
      session = await TableSession.findOne({ tableId: table._id, status: 'active' });
    }
    if (session) {
      session.status = 'completed';
      session.totalAmount = finalTotal;
      session.endTime = new Date();
      await session.save();
    }

    res.json({
      data: { finalTotal, orderCount: allTableOrders.length },
      message: `Bill of ₹${finalTotal.toFixed(2)} requested successfully for Table ${tableQueryId}! Your waiter will be right with you.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Table Status (available, occupied, billing, cleaning)
router.put(['/:tableId/status', '/status/:tableId'], async (req, res) => {
  try {
    const { tableId } = req.params;
    const { status, guestCount } = req.body;

    const allowedStatuses = ['available', 'occupied', 'billing', 'cleaning', 'reserved', 'maintenance'];
    const validStatus = allowedStatuses.includes(status) ? status : 'available';

    const isValidObjectId = String(tableId).match(/^[0-9a-fA-F]{24}$/);
    const queryConditions = [{ tableNumber: String(tableId) }];
    if (isValidObjectId) {
      queryConditions.push({ _id: tableId });
    }

    let table = await Table.findOne({ $or: queryConditions });

    if (!table) {
      if (validStatus === 'billing') {
        return res.status(400).json({ message: `Cannot set status to billing for an empty table. Guests must be seated first.` });
      }
      table = await Table.create({
        tableNumber: String(tableId),
        status: validStatus,
        guestCount: validStatus === 'occupied' ? (guestCount || 2) : 0,
        qrToken: crypto.randomBytes(16).toString('hex'),
      });
    } else {
      if (validStatus === 'billing' && table.status === 'available') {
        return res.status(400).json({ message: `Cannot set Table ${table.tableNumber} to billing. Table is currently available with no active order.` });
      }
      table.status = validStatus;
      if (validStatus === 'occupied') {
        table.guestCount = guestCount || table.guestCount || 2;
      } else if (validStatus === 'available' || validStatus === 'cleaning') {
        table.guestCount = 0;
        await TableSession.updateMany(
          { tableId: table._id, status: 'active' },
          { status: 'completed', endTime: new Date() }
        ).catch(() => {});
      }
      await table.save();
    }

    res.json({
      success: true,
      message: `Table ${table.tableNumber} status updated to ${table.status}`,
      data: table
    });
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
