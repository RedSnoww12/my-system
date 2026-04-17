import { useEffect } from 'react';
import { onLocalWrite } from '@/lib/storage';
import { useSessionStore } from '@/store/useSessionStore';
import { cloudSave } from '@/features/auth/cloudSync';

const DEBOUNCE_MS = 2000;

export function useCloudSync(): void {
  const user = useSessionStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = onLocalWrite(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void cloudSave(user);
      }, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [user]);
}
