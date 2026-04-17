import { useEffect } from 'react';

interface LockableOrientation {
  lock?: (orientation: 'portrait') => Promise<void>;
}

export function usePortraitLock(): void {
  useEffect(() => {
    const target =
      window.screen && 'orientation' in window.screen
        ? (window.screen.orientation as unknown as LockableOrientation)
        : null;
    if (!target?.lock) return;
    target.lock('portrait').catch(() => {
      /* rejected when not fullscreen or unsupported — manifest/CSS cover it */
    });
  }, []);
}
