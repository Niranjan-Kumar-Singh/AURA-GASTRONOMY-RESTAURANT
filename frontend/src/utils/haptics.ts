/**
 * Ultra-lightweight Web Haptic Feedback Utility
 * Provides native tactile response on mobile devices for key dining interactions
 */
export const triggerHaptic = (type: 'tap' | 'success' | 'warning' | 'error' = 'tap') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(8); // Subtle 8ms tick
        break;
      case 'success':
        navigator.vibrate([12, 40, 18]); // Quick double pulse for checkout/order placement
        break;
      case 'warning':
        navigator.vibrate([25, 30, 25]);
        break;
      case 'error':
        navigator.vibrate([40, 50, 40]);
        break;
    }
  } catch {
    // Graceful fallback if device policy restricts vibration
  }
};
