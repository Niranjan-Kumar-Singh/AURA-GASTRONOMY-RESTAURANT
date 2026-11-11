import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initAudioUnlocker } from './utils/audio';

// Automatically unlock Web Audio API context on first user touch/click for mobile tablets
initAudioUnlocker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register PWA Service Worker for offline asset caching in production
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (import.meta as any).env?.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA ServiceWorker registration failed:', err);
    });
  });
}
