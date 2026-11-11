const { EventEmitter } = require('events');

/**
 * AURA GASTRONOMY - Real-Time Server-Sent Events (SSE) EventBus
 * Ultra-low latency (< 50ms) push notifications from:
 * Customer (Order & Waiter Call) ➔ Kitchen KDS ➔ Waiter Terminal ➔ Cashier POS
 */
class RealtimeEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0); // Unlimited internal event listeners
    this.clients = new Set();

    // Send keepalive heartbeat every 20 seconds to prevent proxy / mobile connection sleep
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 20000);

    if (this.heartbeatTimer.unref) {
      this.heartbeatTimer.unref();
    }
  }

  /**
   * Register a new persistent SSE client connection
   * @param {import('express').Response} res
   * @param {string} clientInfo
   */
  addClient(res, clientInfo = 'unknown') {
    this.clients.add(res);

    // Send immediate connection acknowledgement
    const welcome = JSON.stringify({
      status: 'CONNECTED',
      message: 'AURA Gastronomy Realtime EventBus Connected',
      activeClients: this.clients.size,
      timestamp: Date.now(),
    });

    res.write(`event: connected\ndata: ${welcome}\n\n`);

    // Handle client disconnect cleanly
    res.on('close', () => {
      this.clients.delete(res);
    });

    res.on('error', () => {
      this.clients.delete(res);
    });
  }

  /**
   * Remove client manually
   * @param {import('express').Response} res
   */
  removeClient(res) {
    this.clients.delete(res);
  }

  /**
   * Broadcast an event to all connected SSE clients instantly (< 50ms)
   * @param {string} eventType - e.g. 'order:new', 'order:status_updated', 'table:waiter_call'
   * @param {object} data - Event payload
   */
  broadcast(eventType, data = {}) {
    const payload = JSON.stringify({
      event: eventType,
      data,
      timestamp: Date.now(),
    });

    const sseMessage = `event: ${eventType}\ndata: ${payload}\n\n`;

    // Emit internally for server-side listeners
    this.emit(eventType, data);

    // Push to all active SSE HTTP streams
    const deadClients = [];
    for (const client of this.clients) {
      try {
        if (client.writableEnded || client.destroyed) {
          deadClients.push(client);
        } else {
          client.write(sseMessage);
        }
      } catch (err) {
        deadClients.push(client);
      }
    }

    // Clean up disconnected clients
    for (const dead of deadClients) {
      this.clients.delete(dead);
    }
  }

  /**
   * Keep-alive comment line / heartbeat
   */
  sendHeartbeat() {
    if (this.clients.size === 0) return;
    const pingMessage = `:keepalive ${Date.now()}\n\n`;
    const deadClients = [];
    for (const client of this.clients) {
      try {
        if (client.writableEnded || client.destroyed) {
          deadClients.push(client);
        } else {
          client.write(pingMessage);
        }
      } catch (err) {
        deadClients.push(client);
      }
    }
    for (const dead of deadClients) {
      this.clients.delete(dead);
    }
  }

  /**
   * Get total number of active real-time subscribers
   */
  getClientCount() {
    return this.clients.size;
  }
}

// Export singleton instance
const eventBus = new RealtimeEventBus();
module.exports = eventBus;

