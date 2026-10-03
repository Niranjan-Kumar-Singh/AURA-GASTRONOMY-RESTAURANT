/**
 * AURA GASTRONOMY - Serverless Vercel Entrypoint
 * Re-exports the fully-hardened Express production application with all routes,
 * security middlewares, rate limiters, and MongoDB connectivity.
 */
const connectDB = require('../backend/config/db');
const app = require('../backend/server');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Vercel MongoDB Connection Error:', err.message);
  }
  return app(req, res);
};
