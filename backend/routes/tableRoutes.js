const express = require('express');
const crypto = require('crypto');
const Table = require('../models/Table');
const TableSession = require('../models/TableSession');
const Order = require('../models/Order');
const WaiterAlert = require('../models/WaiterAlert');
const router = express.Router();

// Helper to generate unique session ID
const generateSessionId = () => `SESS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// Seed a table for testing if it doesn't exist (strictly bounded to tables 1-30)
router.post('/seed/:tableNumber', async (req, res) => {
  try {
    const num = parseInt(req.params.tableNumber, 10);
    if (isNaN(num) || num < 1 || num > 30) {
      return res.status(400).json({ success: false, message: 'Invalid table number. Must be between 1 and 30.' });
    }

    let table = await Table.findOne({ tableNumber: String(num) });
    if (!table) {
      table = await Table.create({
        tableNumber: String(num),
        capacity: num % 4 === 0 ? 6 : num % 2 === 0 ? 4 : 2,
        qrToken: crypto.randomBytes(16).toString('hex'),
      });
    }
    res.json({ data: table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DEV MODE ONLY: Seed and return session without checking token (bounded to tables 1-30)
router.post('/dev-seed', async (req, res) => {
  try {
    const { tableNumber, userId } = req.body;
    const num = parseInt(tableNumber, 10);
    if (isNaN(num) || num < 1 || num > 30) {
      return res.status(400).json({ success: false, message: 'Invalid table number. Must be between 1 and 30.' });
    }

    const tableNumStr = String(num);
    let table = await Table.findOne({ tableNumber: tableNumStr });
    if (!table) {
      table = await Table.create({
        tableNumber: tableNumStr,
        capacity: num % 4 === 0 ? 6 : num % 2 === 0 ? 4 : 2,
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
      await table.save().catch(() => {});
    } else {
      if (userId && !session.users.some(u => u._id.toString() === userId || u.toString() === userId)) {
        session.users.push(userId);
        await session.save().catch(() => {});
      }
    }

    res.json({ data: { tableNumber: table.tableNumber, session, table } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all tables (For Waiter Dashboard - Ensures strictly 30 tables exist: 1 to 30)
router.get('/', async (req, res) => {
  try {
    const validTableNumbers = Array.from({ length: 30 }, (_, i) => String(i + 1));
    
    // Purge any legacy/invalid tables outside 1-30
    await Table.deleteMany({ tableNumber: { $nin: validTableNumbers } }).catch(() => {});

    let tables = await Table.find({ tableNumber: { $in: validTableNumbers } });
    
    // Auto-seed missing tables within 1 to 30 range
    if (tables.length < 30) {
      const existingNumbers = new Set(tables.map(t => String(t.tableNumber)));
      const tablesToCreate = [];

      for (let i = 1; i <= 30; i++) {
        const numStr = String(i);
        if (!existingNumbers.has(numStr)) {
          tablesToCreate.push({
            tableNumber: numStr,
            capacity: i % 4 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
            status: 'available',
            qrToken: crypto.randomBytes(16).toString('hex'),
          });
        }
      }

      if (tablesToCreate.length > 0) {
        await Table.insertMany(tablesToCreate);
        tables = await Table.find({ tableNumber: { $in: validTableNumbers } });
      }
    }

    // Strictly sort numerically 1 to 30
    tables.sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber));

    // For each table, attach active session details
    const tablesWithSessions = await Promise.all(tables.map(async (table) => {
      // Auto-transition table from 'cleaning' to 'available' after 2.5 minutes (150,000ms)
      if (table.status === 'cleaning' && table.cleaningStartedAt) {
        const elapsedMs = Date.now() - new Date(table.cleaningStartedAt).getTime();
        if (elapsedMs >= 2.5 * 60 * 1000) {
          table.status = 'available';
          table.cleaningStartedAt = null;
          table.guestCount = 0;
          await table.save().catch(() => {});
        }
      }

      const activeSession = await TableSession.findOne({ tableId: table._id, status: 'active' }).populate('orders');
      
      let orderTotal = 0;
      let guestCount = 0;
      let activeOrderId = null;
      let orderStatus = null;

      if (activeSession) {
        guestCount = table.guestCount || (activeSession.users ? activeSession.users.length : 0);
        if (activeSession.orders && activeSession.orders.length > 0) {
          const unpaidOrders = activeSession.orders.filter((o) => o && o.paymentStatus !== 'PAID' && o.status !== 'cancelled');
          if (unpaidOrders.length > 0) {
            const latestOrder = unpaidOrders[unpaidOrders.length - 1];
            activeOrderId = latestOrder.orderId;
            orderStatus = latestOrder.status; // 'received' | 'preparing' | 'ready' | 'served' | 'completed'
            orderTotal = unpaidOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);

            // Auto-heal table status to 'occupied' if active unpaid orders exist!
            if (table.status === 'available') {
              table.status = 'occupied';
              await table.save().catch(() => {});
            }
          }
        }
      }

      if (table.status === 'available' || table.status === 'cleaning') {
        guestCount = 0;
      }

      return {
        _id: table._id,
        tableNumber: Number(table.tableNumber),
        status: table.status,
        orderStatus,
        capacity: table.capacity || 4,
        activeOrderId,
        orderTotal,
        guestCount,
        qrToken: table.qrToken,
        cleaningStartedAt: table.cleaningStartedAt
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

// GET / POST Scan Table QR Code by opaque token (Used by customer mobile when scanning physical QR stand)
router.all('/scan/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.body?.userId || req.query?.userId;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing table QR token.' });
    }

    const table = await Table.findOne({ qrToken: token });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired table QR code. Please scan the official QR code placed on your dining table.'
      });
    }

    // Find or create active session
    let session = await TableSession.findOne({ tableId: table._id, status: 'active' }).populate('users');
    if (!session) {
      session = await TableSession.create({
        tableId: table._id,
        sessionId: generateSessionId(),
        users: userId ? [userId] : [],
      });
      if (table.status === 'available') {
        table.status = 'occupied';
        table.guestCount = table.guestCount || 2;
        await table.save().catch(() => {});
      }
    } else {
      if (userId && !session.users.some(u => u._id?.toString() === userId || u.toString() === userId)) {
        session.users.push(userId);
        await session.save().catch(() => {});
      }
    }

    res.json({
      success: true,
      data: {
        tableNumber: String(table.tableNumber),
        qrToken: table.qrToken,
        sessionId: session.sessionId,
        capacity: table.capacity,
        status: table.status,
        session
      }
    });
  } catch (error) {
    console.error('Error handling table QR scan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET QR Token for a specific Table Number (e.g. for generating table stands or redirects)
router.get('/qr-token/:tableNumber', async (req, res) => {
  try {
    const cleanTableNum = String(req.params.tableNumber || '').match(/\d+/)?.[0] || '1';
    let table = await Table.findOne({ tableNumber: cleanTableNum });

    if (!table) {
      table = await Table.create({
        tableNumber: cleanTableNum,
        capacity: Number(cleanTableNum) % 4 === 0 ? 6 : Number(cleanTableNum) % 2 === 0 ? 4 : 2,
        status: 'available',
        qrToken: crypto.randomBytes(16).toString('hex')
      });
    } else if (!table.qrToken) {
      table.qrToken = crypto.randomBytes(16).toString('hex');
      await table.save().catch(() => {});
    }

    res.json({
      success: true,
      data: {
        tableNumber: table.tableNumber,
        qrToken: table.qrToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST rotate/regenerate QR Code Token for a Table (Security enhancement for managers)
router.post(['/:tableId/rotate-qr', '/rotate-qr/:tableId'], async (req, res) => {
  try {
    const { tableId } = req.params;
    const cleanTableNum = String(tableId || '').match(/\d+/)?.[0] || '1';
    const isObjectId = String(tableId).match(/^[0-9a-fA-F]{24}$/);

    const table = await Table.findOne({
      $or: [{ tableNumber: cleanTableNum }, { _id: isObjectId ? tableId : null }]
    });

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }

    // Generate fresh cryptographic token
    table.qrToken = crypto.randomBytes(16).toString('hex');
    await table.save();

    res.json({
      success: true,
      message: `Table ${table.tableNumber} QR token regenerated successfully.`,
      data: {
        tableNumber: table.tableNumber,
        qrToken: table.qrToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    // Find active UNPAID orders for this table session
    const tableQueryId = table ? String(table.tableNumber) : identifier;
    const allTableOrders = await Order.find({
      $or: [
        { tableId: tableQueryId },
        { tableId: `table/${tableQueryId}/menu` },
        { tableId: `table-${tableQueryId}` },
        { tableId: identifier }
      ],
      paymentStatus: { $ne: 'PAID' },
      status: { $ne: 'cancelled' }
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
      // Smart Status Guard Rule: Prevent setting table to 'available' if active unpaid orders exist!
      if (validStatus === 'available') {
        const cleanNum = String(table.tableNumber);
        const directUnpaidOrders = await Order.find({
          $or: [
            { tableId: cleanNum },
            { tableId: `table/${cleanNum}/menu` },
            { tableId: `table-${cleanNum}` },
            { tableId: String(table._id) }
          ],
          paymentStatus: { $ne: 'PAID' },
          status: { $ne: 'cancelled' }
        });

        if (directUnpaidOrders.length > 0) {
          return res.status(400).json({
            message: `Cannot set Table ${table.tableNumber} to Available: Active unpaid orders exist (${directUnpaidOrders.length} active order). Please settle bill or cancel order first.`
          });
        }
      }

      if (validStatus === 'billing' && table.status === 'available') {
        return res.status(400).json({ message: `Cannot set Table ${table.tableNumber} to billing. Table is currently available with no active order.` });
      }

      table.status = validStatus;

      if (validStatus === 'cleaning') {
        table.cleaningStartedAt = new Date();
        table.guestCount = 0;
      } else if (validStatus === 'occupied') {
        table.guestCount = guestCount || table.guestCount || 2;
        table.cleaningStartedAt = null;
      } else if (validStatus === 'billing') {
        table.cleaningStartedAt = null;
      } else if (validStatus === 'available') {
        table.guestCount = 0;
        table.cleaningStartedAt = null;
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

// In-memory & DB synchronized Waiter Alerts queue for instant cross-device dispatch
let globalWaiterAlerts = [];

// POST create waiter call alert
router.post('/call-waiter', async (req, res) => {
  try {
    const { tableId, reason } = req.body;
    const cleanTableNum = String(tableId || '').match(/\d+/)?.[0] || String(tableId || '1');
    const alertId = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAlert = {
      id: alertId,
      tableId: cleanTableNum,
      tableNumber: cleanTableNum,
      reason: reason || 'Call Waiter to Table',
      timestamp: timeStr,
      status: 'PENDING',
    };

    // 1. Keep in memory for instant millisecond response
    globalWaiterAlerts.unshift(newAlert);
    if (globalWaiterAlerts.length > 50) globalWaiterAlerts.pop();

    // 2. Persist to MongoDB so alerts survive serverless restarts
    try {
      await WaiterAlert.create({
        id: alertId,
        tableId: cleanTableNum,
        tableNumber: cleanTableNum,
        reason: reason || 'Call Waiter to Table',
        timestamp: timeStr,
        status: 'PENDING',
      });
    } catch (dbErr) {
      console.warn('WaiterAlert MongoDB create warning:', dbErr.message);
    }

    // 3. Update Table document with active alert & billing status if bill request
    try {
      let table = await Table.findOne({ tableNumber: cleanTableNum });
      if (table) {
        table.activeWaiterCall = {
          reason: newAlert.reason,
          timestamp: timeStr,
          status: 'PENDING',
        };
        if (reason && reason.toLowerCase().includes('bill')) {
          table.status = 'billing';
        }
        await table.save();
      }
    } catch (tblErr) {
      console.warn('Table update for waiter call warning:', tblErr.message);
    }

    res.json({ success: true, data: newAlert });
  } catch (error) {
    console.error('Error handling call waiter:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET all active waiter calls (DB prioritized, memory fallback)
router.get('/waiter-calls', async (req, res) => {
  try {
    let dbAlerts = [];
    try {
      dbAlerts = await WaiterAlert.find().sort({ createdAt: -1 }).limit(50).lean();
    } catch (e) {
      // DB fallback
    }

    if (dbAlerts && dbAlerts.length > 0) {
      // Sync memory with DB
      globalWaiterAlerts = dbAlerts.map(a => ({
        id: a.id,
        tableId: a.tableId || a.tableNumber,
        tableNumber: a.tableNumber || a.tableId,
        reason: a.reason,
        timestamp: a.timestamp,
        status: a.status,
      }));
      return res.json({ data: globalWaiterAlerts });
    }

    res.json({ data: globalWaiterAlerts });
  } catch (error) {
    console.error('Error fetching waiter calls:', error);
    res.json({ data: globalWaiterAlerts });
  }
});

// PUT acknowledge/resolve waiter call
router.put('/waiter-calls/:id/resolve', async (req, res) => {
  try {
    const alertId = Number(req.params.id);
    globalWaiterAlerts = globalWaiterAlerts.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a);

    let targetTableNum = null;
    const foundInMemory = globalWaiterAlerts.find(a => a.id === alertId);
    if (foundInMemory) targetTableNum = foundInMemory.tableNumber || foundInMemory.tableId;

    // Persist resolution in DB
    try {
      const updatedDbAlert = await WaiterAlert.findOneAndUpdate(
        { id: alertId },
        { status: 'RESOLVED', resolvedAt: new Date() },
        { new: true }
      );
      if (updatedDbAlert) {
        targetTableNum = updatedDbAlert.tableNumber || updatedDbAlert.tableId;
      }
    } catch (dbErr) {
      console.warn('WaiterAlert DB resolve warning:', dbErr.message);
    }

    // Clear activeWaiterCall from Table document
    if (targetTableNum) {
      try {
        const cleanTableNum = String(targetTableNum).match(/\d+/)?.[0] || String(targetTableNum);
        const table = await Table.findOne({ tableNumber: cleanTableNum });
        if (table && table.activeWaiterCall) {
          table.activeWaiterCall = undefined;
          await table.save();
        }
      } catch (tblErr) {
        console.warn('Table activeWaiterCall clear warning:', tblErr.message);
      }
    }

    res.json({ success: true, data: globalWaiterAlerts });
  } catch (error) {
    console.error('Error resolving waiter call:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET Table by Table Number
router.get('/table-number/:tableNumber', async (req, res) => {
  try {
    const cleanTableNum = String(req.params.tableNumber || '').match(/\d+/)?.[0] || '1';
    const table = await Table.findOne({ tableNumber: cleanTableNum });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ data: table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET Shared Table Cart for a specific Table Number (Laptop/Mobile Multi-Device Sync)
router.get('/table-number/:tableNumber/cart', async (req, res) => {
  try {
    const cleanTableNum = String(req.params.tableNumber || '').match(/\d+/)?.[0] || '1';
    const table = await Table.findOne({ tableNumber: cleanTableNum });
    if (!table) return res.json({ data: [] });

    const session = await TableSession.findOne({ tableId: table._id, status: 'active' });
    if (!session) return res.json({ data: [] });

    res.json({ data: session.activeCart || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT Update Shared Table Cart for a specific Table Number
router.put('/table-number/:tableNumber/cart', async (req, res) => {
  try {
    const cleanTableNum = String(req.params.tableNumber || '').match(/\d+/)?.[0] || '1';
    const { items } = req.body;

    let table = await Table.findOne({ tableNumber: cleanTableNum });
    if (!table) {
      table = await Table.create({
        tableNumber: cleanTableNum,
        status: 'occupied',
        qrToken: crypto.randomBytes(16).toString('hex'),
      });
    }

    // Atomic update or insert using findOneAndUpdate to prevent parallel save VersionErrors
    const newSessionId = `SESS-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const session = await TableSession.findOneAndUpdate(
      { tableId: table._id, status: 'active' },
      {
        $setOnInsert: { sessionId: newSessionId, tableId: table._id, status: 'active' },
        $set: { activeCart: Array.isArray(items) ? items : [] }
      },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    if (table.status === 'available') {
      table.status = 'occupied';
      await table.save().catch(() => {});
    }

    res.json({ success: true, data: session ? session.activeCart : [] });
  } catch (error) {
    console.error('Error updating table cart:', error);
    res.status(500).json({ message: error.message || 'Server error updating cart' });
  }
});

module.exports = router;
