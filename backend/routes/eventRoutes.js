const express = require('express');
const eventBus = require('../utils/eventBus');
const router = express.Router();

/**
 * GET /api/events/stream
 * Persistent Server-Sent Events (SSE) connection stream.
 * Automatically broadcasts updates to all listening terminals.
 */
router.get('/stream', (req, res) => {
  // Set SSE streaming headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable proxy buffering for instant delivery
    'Access-Control-Allow-Origin': '*',
  });

  if (res.flushHeaders) {
    res.flushHeaders();
  }

  // Register client in event bus
  eventBus.addClient(res, req.headers['x-forwarded-for'] || req.socket.remoteAddress);
});

/**
 * GET /api/events/status
 * Health check & active subscriber count
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    activeSubscribers: eventBus.getClientCount(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/events/test-broadcast
 * Dev/Diagnostic broadcast endpoint
 */
router.post('/test-broadcast', (req, res) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-dev-secret'] !== process.env.DEV_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { event = 'diagnostic:ping', data = { message: 'Test ping from server' } } = req.body;
  eventBus.broadcast(event, data);
  res.json({ success: true, broadcastedTo: eventBus.getClientCount(), event, data });
});

module.exports = router;
