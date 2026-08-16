import { useEffect } from 'react';

/**
 * Custom React hook to prevent background scrolling when any modal/drawer is open.
 */
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLocked]);
};
