import { useMemo, useState } from 'react';
import { ALL_MUSCLES, SPLITS, SPLIT_MUSCLES } from '@/data/constants';
import { useTrackingStore } from '@/store/useTrackingStore';
import { toast } from '@/components/ui/toastStore';
import { todayISO } from '@/lib/date';
import { sanitizeInteger } from '@/lib/numericInput';
import type { MuscleVolume, Split, Workout } from '@/types';

export default function MuscuForm() {
  const addWorkout = useTrackingStore((s) => s.addWorkout);

  const [split, setSplit] = useState<Split | ''>('Push');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  const muscles = useMemo(() => {
    if (!split) return ALL_MUSCLES;
    return SPLIT_MUSCLES[split];
  }, [split]);

  const totalSets = Object.values(volumes).reduce((s, v) => s + v, 0);

  const toggleMuscle = (m: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const setVolume = (m: string, raw: string) => {
    const n = parseInt(sanitizeInteger(raw), 10) || 0;
    setVolumes((prev) => ({ ...prev, [m]: n }));
  };

  const handleSave = () => {
    const type = split || 'Séance';
    const dur = parseInt(duration, 10) || 0;
    if (!dur) {
      toast('Durée requise', 'error');
      return;
    }
    const volList: MuscleVolume[] = Object.entries(volumes)
      .filter(([, v]) => v > 0)
      .map(([name, sets]) => ({ name, sets }));

    const workout: Workout = {
      id: Date.now(),
      date: todayISO(),
      type,
      dur,
      muscles: volList.length > 0 ? volList : undefined,
      notes: notes.trim() || undefined,
    };
    addWorkout(workout);
    toast(`Séance ${type} enregistrée`, 'success');
    setSplit('Push');
    setDuration('');
    setNotes('');
    setVolumes({});
    setSelectedMuscles([]);
  };

  return (
    <>
      <div className="kl-sport-section-lbl">
        <span className="kl-sport-section-bar" aria-hidden />
        SPLIT
      </div>
      <div className="kl-sport-splits">
        {SPLITS.map((s) => {
          const on = s === split;
          return (
            <button
              key={s}
              type="button"
              className={`kl-sport-split ${on ? 'on' : ''}`}
              onClick={() => setSplit(on ? '' : s)}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="kl-sport-section-lbl">
        <span className="kl-sport-section-bar" aria-hidden />
        GROUPES MUSCULAIRES
      </div>
      <div className="kl-sport-muscle-card">
        <div className="kl-sport-muscles">
          {muscles.map((m) => {
            const on = selectedMuscles.includes(m);
            return (
              <button
                key={m}
                type="button"
                className={`kl-sport-muscle ${on ? 'on' : ''}`}
                onClick={() => toggleMuscle(m)}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {selectedMuscles.length > 0 && (
        <div className="kl-sport-vol">
          <div className="kl-sport-section-lbl kl-sport-section-inline">
            <span className="kl-sport-section-bar" aria-hidden />
            VOLUME · SÉRIES / SEMAINE
          </div>
          {selectedMuscles.map((m) => (
            <div key={m} className="kl-sport-vol-row">
              <span className="kl-sport-vol-name">{m}</span>
              <input
                type="text"
                inputMode="numeric"
                className="kl-sport-vol-inp"
                value={volumes[m] ? String(volumes[m]) : ''}
                onChange={(e) => setVolume(m, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      )}

      <div className="kl-sport-stats">
        <div className="kl-sport-stat">
          <div className="kl-sport-stat-lbl">DURÉE · MIN</div>
          <input
            type="text"
            inputMode="numeric"
            className="kl-sport-stat-inp"
            placeholder="60"
            value={duration}
            onChange={(e) => setDuration(sanitizeInteger(e.target.value))}
          />
        </div>
        <div className="kl-sport-stat">
          <div className="kl-sport-stat-lbl">SETS</div>
          <div className="kl-sport-stat-display" aria-label="Total des séries">
            {totalSets}
          </div>
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
