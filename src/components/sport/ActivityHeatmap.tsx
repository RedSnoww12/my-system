import { useMemo } from 'react';
import { todayISO } from '@/lib/date';
import type { Workout } from '@/types';

interface Props {
  workouts: Workout[];
}

interface DayCell {
  date: string;
  dur: number;
}

const WINDOW = 28;

export default function ActivityHeatmap({ workouts }: Props) {
  const cells = useMemo<DayCell[]>(() => {
    const today = todayISO();
    const byDate = new Map<string, number>();
    workouts.forEach((w) => {
      byDate.set(w.date, (byDate.get(w.date) ?? 0) + w.dur);
    });
    const arr: DayCell[] = [];
    for (let i = WINDOW - 1; i >= 0; i--) {
      const d = new Date(today + 'T00:00:00');
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      arr.push({ date: iso, dur: byDate.get(iso) ?? 0 });
    }
    return arr;
  }, [workouts]);

  const max = Math.max(30, ...cells.map((c) => c.dur));
  const totalMin = cells.reduce((s, c) => s + c.dur, 0);
  const activeDays = cells.filter((c) => c.dur > 0).length;

  return (
    <section className="kl-sport-heatmap">
      <div className="kl-sport-section-lbl kl-sport-section-inline">
        <span className="kl-sport-section-bar" aria-hidden />
        ACTIVITÉ · 28J
        <span className="kl-sport-heatmap-meta">
          {activeDays}j · {totalMin}min
        </span>
      </div>
      <div className="kl-sport-heatmap-grid" aria-hidden>
        {cells.map((c) => {
          const ratio = c.dur > 0 ? Math.min(1, c.dur / max) : 0;
          const strength = c.dur > 0 ? 'on' : 'off';
          const tier =
            ratio > 0.7
              ? 'tier-3'
              : ratio > 0.4
                ? 'tier-2'
                : ratio > 0
                  ? 'tier-1'
                  : '';
          return (
            <span
              key={c.date}
              className={`kl-sport-heat-cell ${strength} ${tier}`}
              title={`${c.date} · ${c.dur} min`}
            />
          );
        })}
      </div>
    </section>
  );
}
