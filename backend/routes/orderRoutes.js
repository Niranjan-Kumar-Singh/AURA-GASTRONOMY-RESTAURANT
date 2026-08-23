const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const TableSession = require('../models/TableSession');
const Table = require('../models/Table');
const router = express.Router();

// Generate a random order ID like ORD-4829
const generateOrderId = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
const generateInvoiceNumber = () => `INV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// DEV UTILITY: Purge all orders & reset table statuses for a fresh start
router.post('/dev/purge-all', async (req, res) => {
  try {
    const deletedOrders = await Order.deleteMany({});
    const deletedSessions = await TableSession.deleteMany({});
    const updatedTables = await Table.updateMany({}, { $set: { status: 'available', guestCount: 0 } });
    res.json({
      success: true,
      message: `Database purged! Deleted ${deletedOrders.deletedCount} orders, ${deletedSessions.deletedCount} sessions. Reset ${updatedTables.modifiedCount} tables to AVAILABLE.`,
      data: {
        deletedOrders: deletedOrders.deletedCount,
        deletedSessions: deletedSessions.deletedCount,
        resetTables: updatedTables.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { tableId, customerPhone, customerName, items, subtotal, tax, discount, total, appliedCoupon, sessionId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const cleanTableNum = String(tableId || '1').match(/\d+/)?.[0] || '1';
    const isObjectId = String(tableId).match(/^[0-9a-fA-F]{24}$/);
    const physicalTable = await Table.findOne({
      $or: [{ tableNumber: cleanTableNum }, { _id: isObjectId ? tableId : null }]
    });

    const queryTableId = physicalTable ? String(physicalTable.tableNumber) : cleanTableNum;

    // Check if an active unpaid order ALREADY exists for this table session
    let existingOrder = await Order.findOne({
      $or: [
        { tableId: queryTableId },
        { tableId: `table/${queryTableId}/menu` },
        { tableId: `table-${queryTableId}` },
        { tableId: String(tableId) },
        { tableId: physicalTable ? String(physicalTable._id) : null }
      ],
      paymentStatus: 'PENDING',
      status: { $ne: 'cancelled' }
    }).sort({ createdAt: -1 });

    let order;

    const formattedNewItems = (items || []).map(it => ({
      menuItemId: it.menuItemId,
      name: it.name,
      quantity: it.quantity || it.qty || 1,
      price: it.price || it.unitPrice || 0,
      notes: it.notes || '',
      customizations: it.customizations || [],
      status: 'received',
      isPrepared: false
    }));

    if (existingOrder) {
      // Append new items directly into the single active Order document preserving existing items' prepared status!
      existingOrder.items.push(...formattedNewItems);
      existingOrder.subtotal = (existingOrder.subtotal || 0) + (subtotal || 0);
      existingOrder.tax = (existingOrder.tax || 0) + (tax || 0);
      existingOrder.discount = (existingOrder.discount || 0) + (discount || 0);
      existingOrder.total = (existingOrder.total || 0) + (total || 0);
      
      if (customerPhone) existingOrder.customerPhone = customerPhone;
      if (customerName) existingOrder.customerName = customerName;
      if (appliedCoupon) existingOrder.appliedCoupon = appliedCoupon;
      
      // Reset order-level status to 'received' or 'preparing' so kitchen gets notified of new items
      existingOrder.status = 'preparing';
      await existingOrder.save();
      order = existingOrder;
    } else {
      // Create a single new Order document for this table session
      order = await Order.create({
        orderId: generateOrderId(),
        tableId: queryTableId,
        customerPhone,
        customerName,
        items: formattedNewItems,
        subtotal,
        tax,
        discount,
        total,
        appliedCoupon,
        status: 'received'
      });
    }

    if (physicalTable) {
      physicalTable.status = 'occupied';
      
      let session = await TableSession.findOne({ tableId: physicalTable._id, status: 'active' });
      if (!session) {
        session = await TableSession.create({
          tableId: physicalTable._id,
          sessionId: `SESS-${Date.now().toString().slice(-6)}`,
          status: 'active',
          orders: [order._id],
          activeCart: []
        });
      } else {
        session.activeCart = [];
        if (!session.orders.includes(order._id)) {
          session.orders.push(order._id);
        }
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

// POST refund an order
router.post('/:orderId/refund', async (req, res) => {
  try {
    const { reason, refundedBy } = req.body;
    const targetOrderId = req.params.orderId;

    const order = await Order.findOneAndUpdate(
      { $or: [{ orderId: targetOrderId }, { _id: targetOrderId.match(/^[0-9a-fA-F]{24}$/) ? targetOrderId : null }] },
      {
        paymentStatus: 'REFUNDED',
        status: 'cancelled',
        refundReason: reason || 'Customer Requested Refund',
        refundedAt: new Date(),
        refundedBy: refundedBy || 'Admin'
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ data: order, message: `Order #${order.orderId} refunded successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all refunded orders
router.get('/refunds/all', async (req, res) => {
  try {
    const refundedOrders = await Order.find({ paymentStatus: 'REFUNDED' }).sort({ refundedAt: -1, updatedAt: -1 });
    res.json({ data: refundedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const targetOrderId = req.params.orderId;
    const isValidObjId = targetOrderId.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOne({
      $or: [{ orderId: targetOrderId }, { _id: isValidObjId ? targetOrderId : null }]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (status === 'ready') {
      // Mark all unserved items as ready and prepared!
      (order.items || []).forEach(it => {
        if (it.status !== 'served') {
          it.status = 'ready';
          it.isPrepared = true;
        }
      });
    } else if (status === 'served') {
      (order.items || []).forEach(it => {
        it.status = 'served';
        it.isPrepared = true;
      });
    }

    await order.save();
    res.json({ data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update individual item check state (Kitchen KDS Item Toggle)
router.put('/:orderId/items/check', async (req, res) => {
  try {
    const { itemIndex, isPrepared } = req.body;
    const targetOrderId = req.params.orderId;
    const isValidObjId = targetOrderId.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOne({
      $or: [{ orderId: targetOrderId }, { _id: isValidObjId ? targetOrderId : null }]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.items && order.items[itemIndex] !== undefined) {
      order.items[itemIndex].isPrepared = !!isPrepared;
      if (isPrepared && order.items[itemIndex].status !== 'served') {
        order.items[itemIndex].status = 'ready';
      }
      await order.save();
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT cancel order (Authority / Staff cancellation with reason)
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;
    const targetOrderId = req.params.orderId;
    const isValidObjId = targetOrderId.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOneAndUpdate(
      { $or: [{ orderId: targetOrderId }, { _id: isValidObjId ? targetOrderId : null }] },
      {
        status: 'cancelled',
        cancelReason: reason || 'Cancelled by Staff / Authority',
        cancelledAt: new Date(),
        cancelledBy: cancelledBy || 'Kitchen Staff'
      },
      { returnDocument: 'after' }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Auto-clean table status if no other active unpaid orders exist on this table
    if (order.tableId) {
      const cleanNum = String(order.tableId).match(/\d+/)?.[0];
      if (cleanNum) {
        const remainingActive = await Order.find({
          tableId: cleanNum,
          paymentStatus: { $ne: 'PAID' },
          status: { $ne: 'cancelled' }
        });
        if (remainingActive.length === 0) {
          await Table.updateOne(
            { tableNumber: cleanNum },
            { $set: { status: 'cleaning', cleaningStartedAt: new Date(), guestCount: 0 } }
          ).catch(() => {});
        }
      }
    }

    res.json({
      success: true,
      message: `Order #${order.orderId} cancelled successfully.`,
      data: order
    });
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
    const cleanTableNum = String(tableId || '').match(/\d+/)?.[0] || '1';
    const isObjId = String(tableId).match(/^[0-9a-fA-F]{24}$/);

    const table = await Table.findOne({
      $or: [{ tableNumber: cleanTableNum }, { _id: isObjId ? tableId : null }]
    });

    // Find active unpaid orders matching any tableId format (e.g. '7', 'table/7/menu', 'table-7')
    const activeOrders = await Order.find({
      $or: [
        { tableId: cleanTableNum },
        { tableId: `table/${cleanTableNum}/menu` },
        { tableId: `table-${cleanTableNum}` },
        { tableId: String(tableId) },
        { tableId: table ? String(table._id) : null }
      ],
      paymentStatus: { $ne: 'PAID' },
      status: { $ne: 'cancelled' }
    });

    if (activeOrders.length === 0) {
      return res.status(400).json({
        message: `No active unpaid orders found for Table ${cleanTableNum}. Bill may already be settled.`
      });
    }

    const invoiceNumber = generateInvoiceNumber();

    for (const ord of activeOrders) {
      ord.status = 'completed';
      ord.paymentStatus = 'PAID';
      ord.paymentMethod = paymentMethod || 'UPI_QR';
      ord.paidAt = new Date();
      ord.invoiceNumber = invoiceNumber;
      await ord.save();
    }

    await Table.updateMany(
      { $or: [{ tableNumber: cleanTableNum }, { _id: table ? table._id : null }] },
      { $set: { status: 'cleaning', cleaningStartedAt: new Date(), guestCount: 0 } }
    );

    if (table) {
      await TableSession.updateMany(
        { tableId: table._id, status: 'active' },
        { $set: { status: 'completed', endTime: new Date() } }
      ).catch(() => {});
    }

    res.json({
      success: true,
      message: `Bill settled successfully via ${paymentMethod || 'UPI_QR'} for Table ${cleanTableNum}! Table set to Cleaning.`,
      data: { invoiceNumber, paymentMethod, paidAt: new Date() }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Auto-cancel orders in 'received' status older than 15 minutes (Kitchen Timeout)
const autoCancelStaleOrders = async () => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const staleOrders = await Order.find({
      status: 'received',
      createdAt: { $lt: fifteenMinsAgo }
    });

    for (const ord of staleOrders) {
      ord.status = 'cancelled';
      ord.cancelReason = 'Order Auto-Cancelled due to Kitchen Response Timeout (15m)';
      ord.cancelledAt = new Date();
      ord.cancelledBy = 'System Auto-Timeout';
      await ord.save();
    }
  } catch (e) {
    // Silence error
  }
};

setInterval(autoCancelStaleOrders, 30000); // Check every 30s

module.exports = router;
