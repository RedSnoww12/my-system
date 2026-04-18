import { useMemo, useState } from 'react';
import SportTypeSelector from '@/components/sport/SportTypeSelector';
import MuscuForm from '@/components/sport/MuscuForm';
import OtherSportForm from '@/components/sport/OtherSportForm';
import WorkoutHistory from '@/components/sport/WorkoutHistory';
import SportHeader from '@/components/sport/SportHeader';
import ActivityHeatmap from '@/components/sport/ActivityHeatmap';
import { useTrackingStore } from '@/store/useTrackingStore';
import { todayISO } from '@/lib/date';
import type { SportCategory } from '@/types';

function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + 'T00:00:00').getTime();
  const b = new Date(bISO + 'T00:00:00').getTime();
  return Math.round((b - a) / 86_400_000);
}

export default function SportPage() {
  const [category, setCategory] = useState<SportCategory>('muscu');
  const workouts = useTrackingStore((s) => s.workouts);

  const { last7Count, streak } = useMemo(() => {
    const today = todayISO();
    const dates = new Set(workouts.map((w) => w.date));
    let count7 = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today + 'T00:00:00');
      d.setDate(d.getDate() - i);
      if (dates.has(d.toISOString().slice(0, 10))) count7 += 1;
    }
    const sortedDates = [...dates].sort();
    let s = 0;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const gap = daysBetween(sortedDates[i], today);
      if (gap === s || gap === s + 1) {
        s = gap + 1;
      } else {
        break;
      }
    }
    return { last7Count: count7, streak: s };
  }, [workouts]);

  return (
    <div className="tp active">
      <SportHeader sessionCount={last7Count} streak={streak} />
      <SportTypeSelector value={category} onChange={setCategory} />
      {category === 'muscu' ? (
        <MuscuForm />
      ) : (
        <OtherSportForm category={category} />
      )}
      <ActivityHeatmap workouts={workouts} />
      <WorkoutHistory />
    </div>
  );
}
