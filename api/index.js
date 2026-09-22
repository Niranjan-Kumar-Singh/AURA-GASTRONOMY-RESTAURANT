/**
 * AURA GASTRONOMY - Serverless Vercel Entrypoint
 * Re-exports the fully-hardened Express production application with all routes,
 * security middlewares, rate limiters, and MongoDB connectivity.
 */
const app = require('../backend/server');

module.exports = app;
