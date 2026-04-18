import { useState } from 'react';
import { SPORT_CATEGORIES } from '@/data/constants';
import { useTrackingStore } from '@/store/useTrackingStore';
import { toast } from '@/components/ui/toastStore';
import { todayISO } from '@/lib/date';
import { sanitizeInteger } from '@/lib/numericInput';
import type { SportCategory, Workout } from '@/types';

interface Props {
  category: Exclude<SportCategory, 'muscu'>;
}

const CAT_ACCENT: Record<Props['category'], string> = {
  cardio: 'var(--cyan)',
  sport: 'var(--org)',
  combat: 'var(--pnk)',
};

export default function OtherSportForm({ category }: Props) {
  const addWorkout = useTrackingStore((s) => s.addWorkout);

  const [sport, setSport] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');

  const options = SPORT_CATEGORIES[category];
  const accent = CAT_ACCENT[category];

  const handleSave = () => {
    const dur = parseInt(duration, 10) || 0;
    if (!dur) {
      toast('Durée requise', 'error');
      return;
    }
    const type = sport || 'Sport';
    const cal = parseInt(calories, 10) || 0;

    const workout: Workout = {
      id: Date.now(),
      date: todayISO(),
      type,
      dur,
      cal: cal || undefined,
      notes: notes.trim() || undefined,
    };
    addWorkout(workout);
    toast(`${type} enregistré`, 'success');
    setSport('');
    setDuration('');
    setCalories('');
    setNotes('');
  };

  return (
    <>
      <div className="kl-sport-section-lbl">
        <span className="kl-sport-section-bar" aria-hidden />
        ACTIVITÉ
      </div>
      <div className="kl-sport-activity-card">
        <div className="kl-sport-muscles">
          {options.map((s) => {
            const on = sport === s;
            return (
              <button
                key={s}
                type="button"
                className={`kl-sport-muscle ${on ? 'on' : ''}`}
                style={
                  on
                    ? ({ '--muscle-color': accent } as React.CSSProperties)
                    : undefined
                }
                onClick={() => setSport(on ? '' : s)}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="kl-sport-stats">
        <div className="kl-sport-stat">
          <div className="kl-sport-stat-lbl">DURÉE · MIN</div>
          <input
            type="text"
            inputMode="numeric"
            className="kl-sport-stat-inp"
            placeholder="45"
            value={duration}
            onChange={(e) => setDuration(sanitizeInteger(e.target.value))}
          />
        </div>
        <div className="kl-sport-stat">
          <div className="kl-sport-stat-lbl">KCAL · BRÛLÉES</div>
          <input
            type="text"
            inputMode="numeric"
            className="kl-sport-stat-inp"
            placeholder="350"
            value={calories}
            onChange={(e) => setCalories(sanitizeInteger(e.target.value))}
          />
        </div>
      </div>

      <div className="kl-sport-notes">
        <input
          type="text"
          className="kl-sport-notes-inp"
          placeholder="Notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="button" className="kl-sport-save" onClick={handleSave}>
        Enregistrer la séance
      </button>
    </>
  );
}
