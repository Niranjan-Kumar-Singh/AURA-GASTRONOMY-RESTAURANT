import { useEffect, useRef, useState } from 'react';

type EventHandler = (data: any) => void;

const getRealtimeEventUrl = (): string => {
  const metaEnv = (import.meta as any).env || {};
  if (metaEnv.VITE_API_URL) {
    return `${metaEnv.VITE_API_URL}/events/stream`;
  }
  if (metaEnv.VITE_API_BASE_URL) {
    return `${metaEnv.VITE_API_BASE_URL}/events/stream`;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/events/stream';
    }
    if (/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
      return `http://${hostname}:5000/api/events/stream`;
    }
    return '/api/events/stream';
  }
  return '/api/events/stream';
};

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private reconnectTimeout: any = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 10000;
  private isConnecting = false;
  private statusListeners: Set<(connected: boolean) => void> = new Set();
  public isConnected = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  public connect() {
    if (this.eventSource || this.isConnecting || typeof window === 'undefined') return;

    this.isConnecting = true;
    const streamUrl = getRealtimeEventUrl();

    try {
      this.eventSource = new EventSource(streamUrl, { withCredentials: true });

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyStatus(true);
      };

      this.eventSource.onerror = () => {
        this.isConnecting = false;
        this.isConnected = false;
        this.notifyStatus(false);
        this.cleanup();
        this.scheduleReconnect();
      };

      // Listen for connected handshake
      this.eventSource.addEventListener('connected', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          this.dispatch('connected', payload);
        } catch (_) {}
      });

      // Forward known event types
      const registeredTypes = [
        'order:new',
        'order:status_updated',
        'order:item_updated',
        'order:item_cancelled',
        'order:cancelled',
        'table:waiter_call',
        'table:waiter_call_resolved',
        'table:status_updated',
        'table:paid',
      ];

      registeredTypes.forEach((type) => {
        this.eventSource?.addEventListener(type, (event: MessageEvent) => {
          try {
            const raw = JSON.parse(event.data);
            const data = raw.data !== undefined ? raw.data : raw;
            this.dispatch(type, data);
          } catch (err) {
            console.warn(`[Realtime] Failed to parse event ${type}:`, err);
          }
        });
      });
    } catch (err) {
      this.isConnecting = false;
      this.isConnected = false;
      this.notifyStatus(false);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  private cleanup() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (_) {}
      this.eventSource = null;
    }
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach((fn) => fn(connected));
  }

  public onStatusChange(callback: (connected: boolean) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.isConnected);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());

      // If already connected, dynamically add listener to EventSource
      if (this.eventSource) {
        this.eventSource.addEventListener(eventType, (event: MessageEvent) => {
          try {
            const raw = JSON.parse(event.data);
            const data = raw.data !== undefined ? raw.data : raw;
            this.dispatch(eventType, data);
          } catch (err) {
            console.warn(`[Realtime] Failed to parse event ${eventType}:`, err);
          }
        });
      }
    }

    this.listeners.get(eventType)!.add(handler);

    // Ensure connection is active
    if (!this.eventSource && !this.isConnecting) {
      this.connect();
    }

    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  private dispatch(eventType: string, data: any) {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (err) {
          console.error(`[Realtime] Error running handler for ${eventType}:`, err);
        }
      });
    }
  }
}

export const realtimeService = new RealtimeClient();

/**
 * React Hook for receiving instant (< 50ms) Server-Sent Events
 * Automatically cleans up on unmount.
 */
export function useRealtimeEvent<T = any>(
  eventType: string,
  handler: (data: T) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsub = realtimeService.subscribe(eventType, (data: T) => {
      handlerRef.current(data);
    });
    return () => {
      unsub();
    };
  }, [eventType]);
}

/**
 * React Hook for tracking active SSE connection status
 */
export function useRealtimeStatus(): boolean {
  const [connected, setConnected] = useState(realtimeService.isConnected);

  useEffect(() => {
    return realtimeService.onStatusChange((status) => {
      setConnected(status);
    });
  }, []);

  return connected;
}

