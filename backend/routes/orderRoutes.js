const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const TableSession = require('../models/TableSession');
const Table = require('../models/Table');
const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const { calculateTier, getTierMultiplier } = require('./loyaltyRoutes');
const router = express.Router();

// Generate a random order ID like ORD-4829
const generateOrderId = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
const generateInvoiceNumber = () => `INV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// Helper: Award Loyalty Points when an order is settled/paid
const awardLoyaltyPointsForOrder = async (order) => {
  try {
    if (!order || order.pointsCredited || !order.customerPhone) return;
    const cleanPhone = String(order.customerPhone).trim();
    if (!cleanPhone) return;

    const user = await User.findOne({ phone: cleanPhone });
    if (!user) return; // Unregistered customer

    // Net paid dining base eligible for points: food subtotal minus coupons and point discounts
    const netDiningBase = Math.max(0, (order.subtotal || 0) - (order.discount || 0) - (order.pointsDiscount || 0));
    const tierMultiplier = getTierMultiplier(user.loyaltyTier || 'STANDARD');
    const ptsEarned = Math.floor((netDiningBase / 10) * tierMultiplier);

    if (ptsEarned > 0) {
      user.loyaltyPoints = (user.loyaltyPoints || 0) + ptsEarned;
      user.lifetimePoints = (user.lifetimePoints || 0) + ptsEarned;
      user.loyaltyTier = calculateTier(user.lifetimePoints);
      await user.save();

      await LoyaltyTransaction.create({
        userId: user._id,
        customerPhone: cleanPhone,
        orderId: order.orderId,
        type: 'EARNED_DINING',
        points: ptsEarned,
        balanceAfter: user.loyaltyPoints,
        description: `Dining Reward (+${ptsEarned} PTS) on Invoice #${order.invoiceNumber || order.orderId} (₹${order.total})`,
        metadata: {
          orderId: order.orderId,
          invoiceNumber: order.invoiceNumber,
          billTotal: order.total,
          tier: user.loyaltyTier,
          multiplier: tierMultiplier
        }
      }).catch(e => console.error('Failed to log loyalty credit tx:', e));

      order.pointsEarned = ptsEarned;
      order.pointsCredited = true;
      await order.save();
    }
  } catch (err) {
    console.error('Error awarding loyalty points for order:', err);
  }
};

// DEV UTILITY: Purge all orders & reset table statuses for a fresh start (Protected with Secret Token)
router.post('/dev/purge-all', async (req, res) => {
  try {
    const devSecret = req.headers['x-dev-secret'] || req.query.secret;
    const expectedSecret = process.env.DEV_SECRET || 'aura-dev-secret-987';

    if (process.env.NODE_ENV === 'production' || devSecret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Security Alert: Purge utility is disabled in production or requires valid x-dev-secret header.'
      });
    }

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
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { 
      tableId, 
      customerPhone, 
      customerName, 
      items, 
      subtotal, 
      tax, 
      discount, 
      total, 
      appliedCoupon, 
      sessionId,
      pointsRedeemed,
      pointsDiscount
    } = req.body;
    
    // 0. Mandatory Customer Mobile Number Validation (Essential for live alerts & diner retention)
    if (!customerPhone || typeof customerPhone !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'A valid 10-digit mobile number is required to place your order and track live kitchen preparation.' 
      });
    }

    const cleanCustomerPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (cleanCustomerPhone.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid 10-digit mobile number (e.g. 9876543210).' 
      });
    }

    // Auto-enroll customer in AURA Loyalty Club if account doesn't exist
    let customerUser = await User.findOne({ 
      $or: [{ phone: cleanCustomerPhone }, { phone: `+91${cleanCustomerPhone}` }] 
    });

    if (!customerUser) {
      const guestName = (customerName && typeof customerName === 'string' && customerName.trim()) 
        ? customerName.trim() 
        : `Diner-${cleanCustomerPhone.slice(-4)}`;

      customerUser = await User.create({
        name: guestName,
        phone: cleanCustomerPhone,
        password: 'aura@' + cleanCustomerPhone,
        role: 'customer',
        status: 'Standard',
        loyaltyPoints: 100, // 100 PTS Welcome Gift!
        lifetimePoints: 100,
        loyaltyTier: 'STANDARD'
      }).catch(err => {
        console.warn('Customer auto-create warning:', err.message);
      });

      if (customerUser) {
        await LoyaltyTransaction.create({
          userId: customerUser._id,
          customerPhone: cleanCustomerPhone,
          type: 'WELCOME_BONUS',
          points: 100,
          balanceAfter: 100,
          description: 'AURA Club Welcome Dining Gift (+100 PTS)',
          metadata: { reason: 'First Order Auto-Enrollment' }
        }).catch(err => console.error('Failed to log welcome loyalty tx:', err));
      }
    } else if (customerName && typeof customerName === 'string' && customerName.trim() && customerUser.name && customerUser.name.startsWith('Diner-')) {
      customerUser.name = customerName.trim();
      await customerUser.save().catch(e => console.warn('Name update warn:', e.message));
    }

    // 1. Data Integrity and Input Sanitization
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one dish item.' });
    }

    const numSubtotal = Math.max(0, parseFloat(subtotal) || 0);
    const numTax = Math.max(0, parseFloat(tax) || 0);
    const numDiscount = Math.max(0, parseFloat(discount) || 0);
    const numTotal = Math.max(0, parseFloat(total) || 0);

    // 2. Server-Side Unit Price Verification Against Database (Anti-Tampering)
    const itemIds = items.map(it => it.menuItemId || it.id).filter(Boolean);
    const dbMenuItems = await MenuItem.find({
      $or: [
        { id: { $in: itemIds.map(Number).filter(n => !isNaN(n)) } },
        { _id: { $in: itemIds.filter(id => mongoose.isValidObjectId(id)) } }
      ]
    });
    const dbMenuMap = new Map();
    dbMenuItems.forEach(item => {
      dbMenuMap.set(String(item.id), item);
      dbMenuMap.set(String(item._id), item);
    });

    let verifiedSubtotal = 0;
    const verifiedNewItems = items.map(it => {
      const targetId = String(it.menuItemId || it.id || '');
      const dbItem = dbMenuMap.get(targetId);
      const quantity = Math.max(1, parseInt(it.quantity || it.qty || 1));
      // Use authentic DB price if found; otherwise fallback to sanitized client price
      const price = dbItem ? dbItem.price : Math.max(0, parseFloat(it.price || it.unitPrice || 0));
      verifiedSubtotal += price * quantity;

      return {
        menuItemId: dbItem ? dbItem.id : (parseInt(it.menuItemId || it.id) || 101),
        name: dbItem ? dbItem.name : String(it.name || 'Artisanal Dish').slice(0, 100),
        quantity,
        price,
        notes: String(it.notes || '').slice(0, 200),
        customizations: Array.isArray(it.customizations) ? it.customizations : [],
        status: 'received',
        isPrepared: false
      };
    });

    // 3. Loyalty Points Validation & Fraud Prevention
    let verifiedRedeemed = 0;
    let verifiedPtsDiscount = 0;
    const requestedRedeemed = parseInt(pointsRedeemed) || 0;

    if (requestedRedeemed > 0) {
      if (!customerPhone) {
        return res.status(400).json({ success: false, message: 'Customer phone number is required to redeem loyalty points.' });
      }
      const cleanPhone = String(customerPhone).trim();
      const user = await User.findOne({ phone: cleanPhone });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Customer account not found for loyalty points redemption.' });
      }
      if ((user.loyaltyPoints || 0) < requestedRedeemed) {
        return res.status(400).json({
          success: false,
          message: `Insufficient loyalty points balance. Available: ${user.loyaltyPoints} PTS, requested: ${requestedRedeemed} PTS.`
        });
      }
      // 1 point = ₹0.50 discount, capped at 50% of verified food subtotal
      const calculatedDiscount = Math.round(requestedRedeemed * 0.5 * 100) / 100;
      const maxAllowedDiscount = Math.round(verifiedSubtotal * 0.5 * 100) / 100;
      if (calculatedDiscount > maxAllowedDiscount) {
        return res.status(400).json({
          success: false,
          message: `Loyalty discount cannot exceed 50% of the food subtotal (Max allowed: ₹${maxAllowedDiscount}).`
        });
      }
      verifiedRedeemed = requestedRedeemed;
      verifiedPtsDiscount = calculatedDiscount;
    }

    // 4. Server-Side Tax & Total Calculation (5% GST)
    const computedTax = Math.round(verifiedSubtotal * 0.05 * 100) / 100;
    const verifiedCouponDiscount = Math.min(verifiedSubtotal, Math.max(0, parseFloat(discount) || 0));
    const calculatedTotal = Math.max(0, Math.round((verifiedSubtotal + computedTax - verifiedCouponDiscount - verifiedPtsDiscount) * 100) / 100);

    const clientQrToken = req.body.qrToken;
    let physicalTable = null;

    // 1. If secure QR token was provided, verify physical table directly from token
    if (clientQrToken) {
      physicalTable = await Table.findOne({ qrToken: clientQrToken });
    }

    // 2. If sessionId was provided, verify table from active session
    if (!physicalTable && sessionId) {
      const activeSess = await TableSession.findOne({ sessionId }).populate('tableId');
      if (activeSess && activeSess.tableId) {
        physicalTable = activeSess.tableId;
      }
    }

    // 3. Fallback to tableId / tableNumber
    if (!physicalTable) {
      const cleanTableNum = String(tableId || '1').match(/\d+/)?.[0] || '1';
      const isObjectId = String(tableId).match(/^[0-9a-fA-F]{24}$/);
      physicalTable = await Table.findOne({
        $or: [{ tableNumber: cleanTableNum }, { _id: isObjectId ? tableId : null }]
      });
    }

    const cleanTableNum = String(tableId || '1').match(/\d+/)?.[0] || '1';
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

    if (existingOrder) {
      // Append new verified items directly into the single active Order document
      existingOrder.items.push(...verifiedNewItems);
      existingOrder.subtotal = (existingOrder.subtotal || 0) + verifiedSubtotal;
      existingOrder.tax = (existingOrder.tax || 0) + computedTax;
      existingOrder.discount = (existingOrder.discount || 0) + verifiedCouponDiscount;
      existingOrder.pointsRedeemed = (existingOrder.pointsRedeemed || 0) + verifiedRedeemed;
      existingOrder.pointsDiscount = (existingOrder.pointsDiscount || 0) + verifiedPtsDiscount;
      existingOrder.total = (existingOrder.total || 0) + calculatedTotal;
      
      if (cleanCustomerPhone) existingOrder.customerPhone = cleanCustomerPhone;
      if (customerName) existingOrder.customerName = customerName;
      if (appliedCoupon) existingOrder.appliedCoupon = appliedCoupon;
      
      // Reset order-level status to 'preparing' so kitchen gets notified of new items
      existingOrder.status = 'preparing';
      await existingOrder.save();
      order = existingOrder;
    } else {
      // Create a single new Order document for this table session
      order = await Order.create({
        orderId: generateOrderId(),
        tableId: queryTableId,
        customerPhone: cleanCustomerPhone,
        customerName: customerName || (customerUser ? customerUser.name : `Diner-${cleanCustomerPhone.slice(-4)}`),
        items: verifiedNewItems,
        subtotal: verifiedSubtotal,
        tax: computedTax,
        discount: verifiedCouponDiscount,
        pointsRedeemed: verifiedRedeemed,
        pointsDiscount: verifiedPtsDiscount,
        total: calculatedTotal,
        appliedCoupon,
        status: 'received'
      });
    }

    // If points were redeemed at checkout, debit from customer wallet and log transaction
    if (verifiedRedeemed > 0 && customerPhone) {
      const cleanPhone = String(customerPhone).trim();
      const user = await User.findOne({ phone: cleanPhone });
      if (user) {
        user.loyaltyPoints = Math.max(0, (user.loyaltyPoints || 0) - verifiedRedeemed);
        await user.save();

        await LoyaltyTransaction.create({
          userId: user._id,
          customerPhone: cleanPhone,
          orderId: order.orderId,
          type: 'REDEEMED_ORDER',
          points: -verifiedRedeemed,
          balanceAfter: user.loyaltyPoints,
          description: `Redeemed ${verifiedRedeemed} PTS (-₹${verifiedPtsDiscount}) at Checkout for Order #${order.orderId}`,
          metadata: { pointsDiscount: verifiedPtsDiscount, orderId: order.orderId }
        }).catch(err => console.error('Failed to log redemption loyalty tx:', err));
      }
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
router.get(['/active', '/active/all'], async (req, res) => {
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

// POST refund an order (Supports Full, Partial, Item-Level, and Custom Amount)
router.post('/:orderId/refund', async (req, res) => {
  try {
    const { amount, reason, refundedBy, refundType, refundedItems, refundMethod } = req.body;
    const targetOrderId = req.params.orderId;
    const isValidObjId = targetOrderId.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOne({
      $or: [{ orderId: targetOrderId }, { _id: isValidObjId ? targetOrderId : null }]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const currentRefunded = Number(order.refundAmount || 0);
    const maxRefundable = Math.max(0, Math.round(((order.total || 0) - currentRefunded) * 100) / 100);

    if (maxRefundable <= 0) {
      return res.status(400).json({ message: 'This invoice has already been 100% refunded.' });
    }

    // Determine the amount to refund
    if (amount !== undefined && (typeof amount !== 'number' || isNaN(amount) || amount <= 0)) {
      return res.status(400).json({ success: false, message: 'Refund amount must be a positive number greater than 0.' });
    }

    let requestedAmount;
    if (typeof amount === 'number' && amount > 0) {
      requestedAmount = Math.min(amount, maxRefundable);
    } else {
      requestedAmount = maxRefundable; // Default to full remaining balance
    }
    requestedAmount = Math.round(requestedAmount * 100) / 100;

    const newTotalRefunded = Math.round((currentRefunded + requestedAmount) * 100) / 100;
    const isFullRefund = newTotalRefunded >= order.total;
    const effectiveType = isFullRefund ? 'FULL' : (refundType || 'PARTIAL');

    order.refundAmount = newTotalRefunded;
    order.refundType = effectiveType;
    order.refundReason = reason || (isFullRefund ? 'Full Bill Refund' : 'Partial / Item Refund');
    order.refundedAt = new Date();
    order.refundedBy = refundedBy || 'Cashier / Manager';
    order.netAmount = Math.max(0, Math.round((order.total - newTotalRefunded) * 100) / 100);

    if (Array.isArray(refundedItems) && refundedItems.length > 0) {
      order.refundItems = refundedItems;
    }

    if (isFullRefund) {
      order.paymentStatus = 'REFUNDED';
      order.status = 'cancelled';
    } else {
      order.paymentStatus = 'PARTIALLY_REFUNDED';
      // If order was in completed/served state, keep it completed so dining record is preserved
      if (!['completed', 'served'].includes(order.status)) {
        order.status = 'completed';
      }
    }

    if (!Array.isArray(order.refundHistory)) {
      order.refundHistory = [];
    }

    order.refundHistory.push({
      amount: requestedAmount,
      reason: reason || (isFullRefund ? 'Full Bill Refund' : 'Partial / Item Refund'),
      refundedBy: refundedBy || 'Cashier / Manager',
      refundedAt: new Date(),
      items: refundedItems || [],
      refundMethod: refundMethod || order.paymentMethod || 'ORIGINAL'
    });

    await order.save();

    // Reconcile loyalty points if points were earned on this order
    if (order.customerPhone && (order.pointsEarned || 0) > 0) {
      try {
        const cleanPhone = String(order.customerPhone).trim();
        const user = await User.findOne({ phone: cleanPhone });
        if (user) {
          const refundRatio = Math.min(1, requestedAmount / (order.total || 1));
          const ptsDeduct = Math.round((order.pointsEarned || 0) * refundRatio);
          if (ptsDeduct > 0) {
            user.loyaltyPoints = Math.max(0, (user.loyaltyPoints || 0) - ptsDeduct);
            await user.save();
            await LoyaltyTransaction.create({
              userId: user._id,
              customerPhone: user.phone,
              orderId: order.orderId,
              type: 'REFUND_DEDUCTION',
              points: -ptsDeduct,
              balanceAfter: user.loyaltyPoints,
              description: `Points reversed (-${ptsDeduct} PTS) due to ₹${requestedAmount} refund on Order #${order.orderId}`,
              metadata: { requestedAmount, invoiceNumber: order.invoiceNumber }
            }).catch(e => console.error('Refund deduction tx err:', e));
          }

          // If 100% full refund and points were redeemed on this order, restore them!
          if (isFullRefund && (order.pointsRedeemed || 0) > 0) {
            user.loyaltyPoints = (user.loyaltyPoints || 0) + order.pointsRedeemed;
            await user.save();
            await LoyaltyTransaction.create({
              userId: user._id,
              customerPhone: user.phone,
              orderId: order.orderId,
              type: 'ORDER_CANCEL_RESTORE',
              points: order.pointsRedeemed,
              balanceAfter: user.loyaltyPoints,
              description: `Restored ${order.pointsRedeemed} redeemed points due to 100% refund on Order #${order.orderId}`,
              metadata: { orderId: order.orderId }
            }).catch(e => console.error('Refund points restore tx err:', e));
          }
        }
      } catch (loyaltyErr) {
        console.error('Error during refund loyalty reconciliation:', loyaltyErr);
      }
    }

    res.json({
      success: true,
      data: order,
      message: isFullRefund
        ? `Invoice #${order.invoiceNumber || order.orderId} fully refunded (₹${requestedAmount.toLocaleString('en-IN')})`
        : `Partial refund of ₹${requestedAmount.toLocaleString('en-IN')} issued for Invoice #${order.invoiceNumber || order.orderId}. Net Retained: ₹${order.netAmount.toLocaleString('en-IN')}`
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET all refunded and partially refunded orders
router.get('/refunds/all', async (req, res) => {
  try {
    const refundedOrders = await Order.find({
      $or: [
        { paymentStatus: 'REFUNDED' },
        { paymentStatus: 'PARTIALLY_REFUNDED' },
        { refundAmount: { $gt: 0 } }
      ]
    }).sort({ refundedAt: -1, updatedAt: -1 });
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

    if (status) order.status = status;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    if (req.body.paymentMethod) {
      let pm = String(req.body.paymentMethod).toUpperCase();
      if (pm === 'UPI') pm = 'UPI_QR';
      if (pm === 'CARD') pm = 'CARD_SWIPE';
      order.paymentMethod = pm;
    }
    if (req.body.paymentStatus === 'PAID' && !order.paidAt) {
      order.paidAt = new Date();
      if (!order.invoiceNumber) {
        order.invoiceNumber = generateInvoiceNumber();
      }
    }

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

    if (order.paymentStatus === 'PAID' || order.status === 'completed') {
      await awardLoyaltyPointsForOrder(order);
    }

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
      if (order.items[itemIndex].status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot toggle preparation status on a cancelled dish' });
      }
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

// PUT cancel an individual item/dish from an order (Chef / Kitchen Item-Level Cancellation)
router.put('/:orderId/items/:itemIndex/cancel', async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;
    const targetOrderId = req.params.orderId;
    const itemIndex = parseInt(req.params.itemIndex, 10);
    const isValidObjId = targetOrderId.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOne({
      $or: [{ orderId: targetOrderId }, { _id: isValidObjId ? targetOrderId : null }]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }
    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Cannot cancel dishes from an already settled bill' });
    }

    if (isNaN(itemIndex) || itemIndex < 0 || !order.items || itemIndex >= order.items.length) {
      return res.status(400).json({ message: 'Invalid item index' });
    }

    const item = order.items[itemIndex];
    if (item.status === 'cancelled') {
      return res.status(400).json({ message: `"${item.name}" is already cancelled` });
    }

    const dishName = item.name;
    const defaultReason = reason || "86'd / Out of Ingredients";
    const actor = cancelledBy || 'Chef';

    // Mark item as cancelled
    item.status = 'cancelled';
    item.cancelReason = defaultReason;
    item.cancelledAt = new Date();
    item.cancelledBy = actor;

    // Recalculate financial totals based strictly on active (non-cancelled) items
    const activeItems = order.items.filter(it => it.status !== 'cancelled');
    const newSubtotal = activeItems.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
    const newTax = Math.round(newSubtotal * 0.05 * 100) / 100; // 5% GST
    const discount = Math.min(newSubtotal, order.discount || 0);
    const pointsDiscount = Math.min(newSubtotal, order.pointsDiscount || 0);
    const newTotal = Math.max(0, Math.round((newSubtotal + newTax - discount - pointsDiscount) * 100) / 100);

    order.subtotal = newSubtotal;
    order.tax = newTax;
    order.discount = discount;
    order.pointsDiscount = pointsDiscount;
    order.total = newTotal;

    // If ALL items are now cancelled, the entire order becomes cancelled
    const allCancelled = order.items.every(it => it.status === 'cancelled');
    if (allCancelled) {
      order.status = 'cancelled';
      order.cancelReason = `All dishes cancelled: ${defaultReason}`;
      order.cancelledAt = new Date();
      order.cancelledBy = actor;

      // Restore redeemed loyalty points if any
      if (order.customerPhone && (order.pointsRedeemed || 0) > 0) {
        try {
          const cleanPhone = String(order.customerPhone).trim();
          const user = await User.findOne({ phone: cleanPhone });
          if (user) {
            user.loyaltyPoints = (user.loyaltyPoints || 0) + order.pointsRedeemed;
            await user.save();
            await LoyaltyTransaction.create({
              userId: user._id,
              customerPhone: cleanPhone,
              orderId: order.orderId,
              type: 'ORDER_CANCEL_RESTORE',
              points: order.pointsRedeemed,
              balanceAfter: user.loyaltyPoints,
              description: `Restored ${order.pointsRedeemed} redeemed points due to cancellation of Order #${order.orderId}`,
              metadata: { orderId: order.orderId, cancelReason: defaultReason }
            }).catch(e => console.error('Failed to log cancel points restore:', e));
          }
        } catch (err) {
          console.error('Error restoring points for cancelled order:', err);
        }
      }
    }

    await order.save();

    res.json({
      success: true,
      message: allCancelled 
        ? `All dishes cancelled. Order #${order.orderId} marked as cancelled.`
        : `"${dishName}" cancelled successfully by ${actor}. Order total recalculated to ₹${newTotal}.`,
      data: order,
      allCancelled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT cancel order (Authority / Staff / Chef cancellation with reason)
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;
    const targetOrderId = req.params.orderId;
    const isValidObjId = targetOrderId.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOne({
      $or: [{ orderId: targetOrderId }, { _id: isValidObjId ? targetOrderId : null }]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const defaultReason = reason || 'Cancelled by Kitchen Staff / Chef';
    const actor = cancelledBy || 'Kitchen Staff';

    order.status = 'cancelled';
    order.cancelReason = defaultReason;
    order.cancelledAt = new Date();
    order.cancelledBy = actor;

    // Mark all items as cancelled as well
    if (Array.isArray(order.items)) {
      order.items.forEach(it => {
        it.status = 'cancelled';
        it.cancelReason = it.cancelReason || defaultReason;
        it.cancelledAt = it.cancelledAt || new Date();
        it.cancelledBy = it.cancelledBy || actor;
      });
    }

    await order.save();

    // Restore redeemed loyalty points if order was cancelled
    if (order.customerPhone && (order.pointsRedeemed || 0) > 0) {
      try {
        const cleanPhone = String(order.customerPhone).trim();
        const user = await User.findOne({ phone: cleanPhone });
        if (user) {
          user.loyaltyPoints = (user.loyaltyPoints || 0) + order.pointsRedeemed;
          await user.save();
          await LoyaltyTransaction.create({
            userId: user._id,
            customerPhone: cleanPhone,
            orderId: order.orderId,
            type: 'ORDER_CANCEL_RESTORE',
            points: order.pointsRedeemed,
            balanceAfter: user.loyaltyPoints,
            description: `Restored ${order.pointsRedeemed} redeemed points due to cancellation of Order #${order.orderId}`,
            metadata: { orderId: order.orderId, cancelReason: defaultReason }
          }).catch(e => console.error('Failed to log cancel points restore:', e));
        }
      } catch (err) {
        console.error('Error restoring cancelled order points:', err);
      }
    }

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
      await awardLoyaltyPointsForOrder(ord);
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
