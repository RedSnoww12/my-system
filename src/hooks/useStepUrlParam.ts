import { useEffect } from 'react';
import { todayISO } from '@/lib/date';
import { useTrackingStore } from '@/store/useTrackingStore';

export function useStepUrlParam(): void {
  useEffect(() => {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get('steps');
    if (!raw) return;

    const value = parseInt(raw, 10);
    if (Number.isNaN(value) || value < 0 || value >= 200_000) return;

    const date = url.searchParams.get('date') ?? todayISO();
    useTrackingStore.getState().setStepsForDate(date, value);

    url.searchParams.delete('steps');
    url.searchParams.delete('date');
    const query = url.searchParams.toString();
    window.history.replaceState(
      null,
      '',
      url.pathname + (query ? `?${query}` : '') + url.hash,
    );
  }, []);
}
