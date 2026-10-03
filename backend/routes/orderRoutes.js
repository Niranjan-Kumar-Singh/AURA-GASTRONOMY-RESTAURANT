const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const TableSession = require('../models/TableSession');
const Table = require('../models/Table');
const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Coupon = require('../models/Coupon');
const { calculateTier, getTierMultiplier } = require('./loyaltyRoutes');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { normalizePhoneQuery } = require('../utils/phoneUtils');
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

    const user = await User.findOne({ $or: normalizePhoneQuery(cleanPhone) });
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

// DEV UTILITY: Purge all orders & reset table statuses for a fresh start (Strictly Non-Production)
router.post('/dev/purge-all', async (req, res) => {
  try {
    const devSecret = req.headers['x-dev-secret'] || req.query.secret;
    const expectedSecret = process.env.DEV_SECRET;
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev || !expectedSecret || devSecret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Security Alert: Purge utility is strictly disabled. Requires NODE_ENV=development and valid x-dev-secret header.'
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
        password: crypto.randomBytes(24).toString('hex'),
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
    const missingItems = [];
    const verifiedNewItems = [];

    for (const it of items) {
      const targetId = String(it.menuItemId || it.id || '');
      const dbItem = dbMenuMap.get(targetId);
      if (!dbItem) {
        missingItems.push(it.name || targetId);
        continue;
      }
      const quantity = Math.max(1, parseInt(it.quantity || it.qty || 1));
      const price = dbItem.price;
      verifiedSubtotal += price * quantity;

      verifiedNewItems.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        quantity,
        price,
        notes: String(it.notes || '').slice(0, 200),
        customizations: Array.isArray(it.customizations) ? it.customizations : [],
        status: 'received',
        isPrepared: false
      });
    }

    if (missingItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following dish item(s) are invalid or no longer available: ${missingItems.join(', ')}.`
      });
    }

    // 3. Loyalty Points Validation & Fraud Prevention
    let verifiedRedeemed = 0;
    let verifiedPtsDiscount = 0;
    const requestedRedeemed = parseInt(pointsRedeemed) || 0;

    if (requestedRedeemed > 0) {
      if (!customerPhone) {
        return res.status(400).json({ success: false, message: 'Customer phone number is required to redeem loyalty points.' });
      }
      const cleanPhone = String(customerPhone).trim();
      const user = await User.findOne({ $or: normalizePhoneQuery(cleanPhone) });
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

    // 4. Server-Side Coupon Validation (S1 fix: never trust client-supplied discount value)
    let verifiedCouponDiscount = 0;
    let verifiedAppliedCouponCode = null;

    if (appliedCoupon && typeof appliedCoupon === 'string' && appliedCoupon.trim()) {
      const couponCode = appliedCoupon.trim().toUpperCase();
      const dbCoupon = await Coupon.findOne({ code: couponCode });

      if (!dbCoupon) {
        return res.status(400).json({ success: false, message: `Coupon "${couponCode}" is not valid or does not exist.` });
      }
      if (!dbCoupon.isActive) {
        return res.status(400).json({ success: false, message: `Coupon "${couponCode}" is no longer active.` });
      }
      if (verifiedSubtotal < dbCoupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Coupon "${couponCode}" requires a minimum order of ₹${dbCoupon.minOrderAmount}. Your subtotal is ₹${verifiedSubtotal.toFixed(2)}.`
        });
      }
      verifiedCouponDiscount = Math.min(verifiedSubtotal, dbCoupon.discountAmount);
      verifiedAppliedCouponCode = couponCode;
    }

    // 5. Server-Side Tax & Total Calculation (5% GST calculated on net taxable dining base)
    const netTaxableBase = Math.max(0, verifiedSubtotal - verifiedCouponDiscount - verifiedPtsDiscount);
    const computedTax = Math.round(netTaxableBase * 0.05 * 100) / 100;
    const calculatedTotal = Math.max(0, Math.round((netTaxableBase + computedTax) * 100) / 100);

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
      // S2 fix: Coupon discount is a one-time order-level discount.
      // Do NOT add verifiedCouponDiscount again on subsequent batches to the same order.
      // Only apply it the first time the coupon is attached to this order.
      if (verifiedAppliedCouponCode && !existingOrder.appliedCoupon) {
        existingOrder.discount = (existingOrder.discount || 0) + verifiedCouponDiscount;
        existingOrder.appliedCoupon = verifiedAppliedCouponCode;
      }
      existingOrder.pointsRedeemed = (existingOrder.pointsRedeemed || 0) + verifiedRedeemed;
      existingOrder.pointsDiscount = (existingOrder.pointsDiscount || 0) + verifiedPtsDiscount;
      // Recalculate total from scratch to avoid compounding rounding errors
      existingOrder.total = Math.max(0, Math.round((
        existingOrder.subtotal + existingOrder.tax - (existingOrder.discount || 0) - (existingOrder.pointsDiscount || 0)
      ) * 100) / 100);
      
      if (cleanCustomerPhone) existingOrder.customerPhone = cleanCustomerPhone;
      if (customerName) existingOrder.customerName = customerName;
      
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
        appliedCoupon: verifiedAppliedCouponCode,
        status: 'received'
      });
    }

    // If points were redeemed at checkout, debit from customer wallet and log transaction
    if (verifiedRedeemed > 0 && customerPhone) {
      const cleanPhone = String(customerPhone).trim();
      const user = await User.findOne({ $or: normalizePhoneQuery(cleanPhone) });
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

// GET orders by phone — Protected: requires authenticated session
// Customers can only see their own orders; staff can look up any phone.
router.get('/phone/:phone', protect, async (req, res) => {
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

// GET active unpaid orders for Kitchen / Waiter / Cashier (Protected: Staff)
router.get(['/active', '/active/all'], protect, requireRole('ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'CHEF'), async (req, res) => {
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

// GET unified live POS sync feed (Protected: Staff)
router.get('/pos/sync', protect, requireRole('ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'CHEF'), async (req, res) => {
  try {
    const [allTables, activeOrders, settledTodayOrders] = await Promise.all([
      Table.find({}).sort({ tableNumber: 1 }).lean(),
      Order.find({
        status: { $in: ['received', 'preparing', 'ready', 'served'] },
        paymentStatus: { $ne: 'PAID' }
      }).sort({ createdAt: 1 }).lean(),
      Order.find({
        paymentStatus: 'PAID'
      }).sort({ paidAt: -1, updatedAt: -1 }).limit(100).lean()
    ]);

    // Build mapping for accurate table number resolution (resolves ObjectIds, strings, and slugs)
    const tableIdToNumberMap = new Map();
    allTables.forEach(t => {
      tableIdToNumberMap.set(String(t._id), String(t.tableNumber));
      tableIdToNumberMap.set(String(t.tableNumber), String(t.tableNumber));
    });

    const getResolvedTableNumber = (rawId) => {
      const clean = String(rawId || '').trim();
      if (tableIdToNumberMap.has(clean)) return tableIdToNumberMap.get(clean);
      const match = clean.match(/\d+/);
      if (match && tableIdToNumberMap.has(match[0])) return match[0];
      return match ? match[0] : clean;
    };

    // Group active orders by table number
    const activeOrdersByTable = new Map();
    activeOrders.forEach(ord => {
      let tNum = getResolvedTableNumber(ord.tableId);
      if (!activeOrdersByTable.has(tNum)) {
        activeOrdersByTable.set(tNum, []);
      }
      activeOrdersByTable.get(tNum).push(ord);
    });

    // Build active POS bills (strictly based on genuine orders & occupied/billing tables)
    const activeBills = [];
    allTables.forEach(tbl => {
      const tNum = String(tbl.tableNumber);
      const orders = activeOrdersByTable.get(tNum) || [];
      const hasOrders = orders.length > 0;
      const isBilling = tbl.status === 'billing';

      if (hasOrders || isBilling) {
        const items = orders.flatMap(ord => (ord.items || []).map(i => ({
          name: i.name,
          qty: i.quantity || 1,
          price: i.price || 0
        })));

        const subtotal = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0) || items.reduce((sum, i) => sum + (i.qty * i.price), 0);
        const cgst = Math.round(subtotal * 0.025);
        const sgst = Math.round(subtotal * 0.025);
        const total = orders.reduce((sum, o) => sum + (o.total || 0), 0) || (subtotal + cgst + sgst);
        const latestOrder = orders[orders.length - 1];

        let zone = 'Main Hall';
        const numVal = parseInt(tNum, 10);
        if (numVal > 12 && numVal <= 16) zone = 'VIP Lounge';
        else if (numVal > 16 && numVal <= 24) zone = 'Outdoor Garden';
        else if (numVal > 24) zone = 'Family Section';

        activeBills.push({
          tableId: String(tbl._id),
          tableNumber: numVal,
          tableName: `Table ${tNum}`,
          zone,
          orderId: orders.map(o => o.orderId).filter(Boolean).join(', ') || `TABLE-${tNum}`,
          customerName: latestOrder?.customerName || `Table ${tNum} Guests`,
          customerMobile: latestOrder?.customerPhone || '',
          items,
          subtotal,
          pointsRedeemed: orders.reduce((sum, o) => sum + (o.pointsRedeemed || 0), 0),
          pointsDiscount: orders.reduce((sum, o) => sum + (o.pointsDiscount || 0), 0),
          cgst,
          sgst,
          total,
          status: isBilling ? 'billing' : 'occupied',
          createdAt: orders[0]?.createdAt || tbl.updatedAt
        });
      }
    });

    // Build settled bills array from settledTodayOrders
    const settledBills = settledTodayOrders.map(dbOrd => {
      const resolvedNumStr = getResolvedTableNumber(dbOrd.tableId);
      const tNum = parseInt(resolvedNumStr, 10) || 1;
      let zone = 'Main Hall';
      if (tNum > 12 && tNum <= 16) zone = 'VIP Lounge';
      else if (tNum > 16 && tNum <= 24) zone = 'Outdoor Garden';
      else if (tNum > 24) zone = 'Family Section';

      const items = (dbOrd.items || []).map(i => ({
        name: i.name,
        qty: i.quantity || 1,
        price: i.price || 0
      }));

      const subtotal = dbOrd.subtotal || items.reduce((sum, i) => sum + (i.qty * i.price), 0);
      const cgst = dbOrd.tax ? Math.round(dbOrd.tax / 2) : Math.round(subtotal * 0.025);
      const sgst = dbOrd.tax ? Math.round(dbOrd.tax / 2) : Math.round(subtotal * 0.025);
      const total = dbOrd.total || (subtotal + cgst + sgst);

      return {
        tableId: `settled-${dbOrd._id}`,
        tableNumber: tNum,
        tableName: `Table ${tNum}`,
        zone,
        orderId: dbOrd.orderId || `ORD-${String(dbOrd._id).slice(-4).toUpperCase()}`,
        customerName: dbOrd.customerName || `Guest (Table ${tNum})`,
        customerMobile: dbOrd.customerPhone || '',
        items,
        subtotal,
        discountAmount: dbOrd.discount || 0,
        pointsDiscount: dbOrd.pointsDiscount || 0,
        cgst,
        sgst,
        total,
        status: 'settled',
        paymentMethod: dbOrd.paymentMethod || 'UPI',
        invoiceNumber: dbOrd.invoiceNumber || `INV-${String(dbOrd._id).slice(-6).toUpperCase()}`,
        paidAt: dbOrd.paidAt ? new Date(dbOrd.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
        paidDate: dbOrd.paidAt ? new Date(dbOrd.paidAt).toLocaleDateString() : 'Today',
        refundAmount: dbOrd.refundAmount || 0,
        refundType: dbOrd.refundType,
        refundReason: dbOrd.refundReason,
        refundedAt: dbOrd.refundedAt,
        refundedBy: dbOrd.refundedBy,
        refundItems: dbOrd.refundItems,
        netAmount: dbOrd.netAmount || (total - (dbOrd.refundAmount || 0))
      };
    });

    // Compute shift statistics
    const shiftTotalRevenue = settledBills.reduce((sum, b) => sum + (b.total || 0), 0);
    const shiftUpiTotal = settledBills.filter(b => (b.paymentMethod || '').includes('UPI')).reduce((sum, b) => sum + (b.total || 0), 0);
    const shiftCardTotal = settledBills.filter(b => (b.paymentMethod || '').includes('CARD')).reduce((sum, b) => sum + (b.total || 0), 0);
    const shiftCashTotal = settledBills.filter(b => (b.paymentMethod || '').includes('CASH')).reduce((sum, b) => sum + (b.total || 0), 0);

    res.json({
      success: true,
      data: {
        activeBills,
        settledBills,
        stats: {
          shiftTotalRevenue,
          shiftUpiTotal,
          shiftCardTotal,
          shiftCashTotal,
          activeCount: activeBills.length,
          settledCount: settledBills.length
        }
      }
    });
  } catch (error) {
    console.error('POS sync feed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all settled/paid orders for Cashier POS & History Archive (Protected: Staff)
router.get('/settled/all', protect, requireRole('ADMIN', 'MANAGER', 'CASHIER'), async (req, res) => {
  try {
    const settledOrders = await Order.find({ paymentStatus: 'PAID' }).sort({ paidAt: -1, updatedAt: -1 });
    res.json({ data: settledOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST refund an order (Protected: ADMIN / MANAGER / CASHIER)
router.post('/:orderId/refund', protect, requireRole('ADMIN', 'MANAGER', 'CASHIER'), async (req, res) => {
  try {
    const { amount, reason, refundType, refundedItems, refundMethod } = req.body;
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

    const actor = req.user?.name || req.user?.email || 'Cashier / Manager';

    order.refundAmount = newTotalRefunded;
    order.refundType = effectiveType;
    order.refundReason = reason || (isFullRefund ? 'Full Bill Refund' : 'Partial / Item Refund');
    order.refundedAt = new Date();
    order.refundedBy = actor;
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
        const user = await User.findOne({ $or: normalizePhoneQuery(cleanPhone) });
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

// GET all refunded and partially refunded orders (Protected: Cashier / Admin)
router.get('/refunds/all', protect, requireRole('ADMIN', 'MANAGER', 'CASHIER'), async (req, res) => {
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

// PUT update order status (Protected: Staff)
router.put('/:orderId/status', protect, requireRole('ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'CHEF'), async (req, res) => {
  try {
    const { status } = req.body;
    const targetOrderId = req.params.orderId;
    const isValidObjId = targetOrderId.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOne({
      $or: [{ orderId: targetOrderId }, { _id: isValidObjId ? targetOrderId : null }]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Guard: Only Cashier and Management can mark bills as PAID
    if (req.body.paymentStatus === 'PAID') {
      let userRole = (req.user?.role || '').toUpperCase();
      if (userRole === 'KITCHEN') userRole = 'CHEF';
      if (!['ADMIN', 'MANAGER', 'CASHIER', 'OWNER'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only Cashiers and Managers can mark orders as PAID.'
        });
      }
    }

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

// PUT update individual item check state (Protected: Kitchen KDS / Waiter)
router.put('/:orderId/items/check', protect, requireRole('ADMIN', 'MANAGER', 'CHEF', 'WAITER'), async (req, res) => {
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

// PUT cancel an individual item/dish from an order (Protected: Chef / Kitchen)
router.put('/:orderId/items/:itemIndex/cancel', protect, requireRole('ADMIN', 'MANAGER', 'CHEF'), async (req, res) => {
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
    const actor = req.user?.name || req.user?.email || cancelledBy || 'Chef';

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
          const user = await User.findOne({ $or: normalizePhoneQuery(cleanPhone) });
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

// PUT cancel order (Protected: Authority / Staff / Chef cancellation with reason)
router.put('/:orderId/cancel', protect, requireRole('ADMIN', 'MANAGER', 'CASHIER', 'CHEF', 'WAITER'), async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;
    const targetOrderId = req.params.orderId;
    const isValidObjId = targetOrderId.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOne({
      $or: [{ orderId: targetOrderId }, { _id: isValidObjId ? targetOrderId : null }]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const defaultReason = reason || 'Cancelled by Restaurant Staff / Kitchen';
    const actor = req.user?.name || req.user?.email || cancelledBy || 'Staff';

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
        const user = await User.findOne({ $or: normalizePhoneQuery(cleanPhone) });
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

// Pay & Settle Table Bill (Protected: Cashier / Admin / Manager / Owner)
router.post('/pay-table', protect, requireRole('ADMIN', 'MANAGER', 'CASHIER', 'OWNER'), async (req, res) => {
  try {
    const { tableId, paymentMethod, discountPercent, discountAmount } = req.body;
    const isObjId = String(tableId).match(/^[0-9a-fA-F]{24}$/);
    let table = null;
    let cleanTableNum = '1';

    if (isObjId) {
      table = await Table.findById(tableId);
      if (table) cleanTableNum = String(table.tableNumber);
    } else {
      cleanTableNum = String(tableId || '').match(/\d+/)?.[0] || '1';
      table = await Table.findOne({ tableNumber: cleanTableNum });
    }

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

    // Calculate POS Manual Discount if provided
    const totalSubtotal = activeOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const appliedDiscountPercent = Math.max(0, Math.min(100, Number(discountPercent) || 0));
    let appliedDiscountAmount = Math.max(0, Number(discountAmount) || 0);

    if (appliedDiscountPercent > 0 && totalSubtotal > 0 && !appliedDiscountAmount) {
      appliedDiscountAmount = Math.round((totalSubtotal * appliedDiscountPercent) / 100);
    }

    let allocatedDiscountSoFar = 0;

    for (let i = 0; i < activeOrders.length; i++) {
      const ord = activeOrders[i];

      if (appliedDiscountAmount > 0 && totalSubtotal > 0) {
        const orderShare = (ord.subtotal || 0) / totalSubtotal;
        const ordDiscount = (i === activeOrders.length - 1)
          ? (appliedDiscountAmount - allocatedDiscountSoFar)
          : Math.round(appliedDiscountAmount * orderShare);

        allocatedDiscountSoFar += ordDiscount;
        ord.discount = (ord.discount || 0) + ordDiscount;

        const netSub = Math.max(0, (ord.subtotal || 0) - ord.discount - (ord.pointsDiscount || 0));
        ord.tax = Math.round(netSub * 0.05);
        ord.total = netSub + ord.tax;
      }

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

module.exports = router;
