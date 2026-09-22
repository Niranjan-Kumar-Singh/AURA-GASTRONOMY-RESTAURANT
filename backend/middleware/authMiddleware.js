const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verifies valid JWT in Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: No authentication token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aura-secret-key-12345');
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized: Token verification failed.' });
  }
};

/**
 * Require specific user role(s) (e.g. ADMIN, MANAGER, CASHIER)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRole = (req.user.role || 'CUSTOMER').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole) && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your role is ${userRole}.`
      });
    }

    next();
  };
};

/**
 * Optional authentication: attaches user if token is provided, otherwise proceeds as guest
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aura-secret-key-12345');
      if (decoded && decoded.id) {
        req.user = await User.findById(decoded.id).select('-password');
      }
    }
  } catch (_) {
    // Proceed silently without setting req.user
  }
  next();
};

module.exports = {
  protect,
  requireRole,
  optionalAuth
};
