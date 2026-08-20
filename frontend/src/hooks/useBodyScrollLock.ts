import { useEffect } from 'react';

/**
 * Custom React hook to prevent background scrolling when any modal/drawer is open.
 * Works across Desktop, iOS Safari, Android Chrome, and touch viewports.
 */
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    // Save initial styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalDocOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    // Lock background scrolling on both <body> and <html>
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.documentElement.style.overflow = originalDocOverflow;
    };
  }, [isLocked]);
};
