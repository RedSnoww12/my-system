import { useState } from 'react';
import SettingsSection from './SettingsSection';
import {
  buildImportPatch,
  parseImportJson,
} from '@/features/data/importHistory';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTrackingStore } from '@/store/useTrackingStore';
import { usePalierStore } from '@/store/usePalierStore';
import { toast } from '@/components/ui/toastStore';

const EXAMPLE = `[
  {
    "date": "2026-04-15",
    "weight": 74.3,
    "targetKcal": 2000,
    "realKcal": 1850,
    "steps": 8500,
    "workout": true
  },
  {
    "date": "2026-04-16",
    "weight": 74.1,
    "targetKcal": 2000,
    "realKcal": 1920,
    "steps": 6200,
    "workout": false
  }
]`;

export default function ImportCard() {
  const weights = useTrackingStore((s) => s.weights);
  const workouts = useTrackingStore((s) => s.workouts);
  const steps = useTrackingStore((s) => s.steps);
  const setWeights = useTrackingStore((s) => s.setWeights);
  const setWorkouts = useTrackingStore((s) => s.setWorkouts);
  const setStepsForDate = useTrackingStore((s) => s.setStepsForDate);
  const log = useNutritionStore((s) => s.log);
  const setDayLog = useNutritionStore((s) => s.setDayLog);
  const targets = useSettingsStore((s) => s.targets);
  const phase = useSettingsStore((s) => s.phase);
  const recompute = usePalierStore((s) => s.recompute);

  const [raw, setRaw] = useState('');
  const [busy, setBusy] = useState(false);

  const handleImport = () => {
    setBusy(true);
    const { entries, error } = parseImportJson(raw);
    if (!entries || error) {
      toast(error ?? 'Import impossible', 'error');
      setBusy(false);
      return;
    }
    if (entries.length === 0) {
      toast('Aucune entrée à importer', 'warn');
      setBusy(false);
      return;
    }

    const patch = buildImportPatch(
      entries,
      { weights, log, steps, workouts },
      { currentKcal: targets.kcal },
    );

    setWeights(patch.weights);
    setWorkouts(patch.workouts);
    Object.entries(patch.steps).forEach(([d, v]) => {
      if (steps[d] !== v) setStepsForDate(d, v);
    });
    Object.entries(patch.log).forEach(([d, v]) => {
      setDayLog(d, v);
    });

    recompute(targets.kcal, phase, patch.weights);

    const { summary } = patch;
    const overwriteMsg = summary.overwrittenDates
      ? ` · ${summary.overwrittenDates} écrasée${summary.overwrittenDates > 1 ? 's' : ''}`
      : '';
    toast(
      `${summary.total} date${summary.total > 1 ? 's' : ''} importée${summary.total > 1 ? 's' : ''}${overwriteMsg}`,
      'success',
    );
    setRaw('');
    setBusy(false);
  };

  return (
    <SettingsSection icon="upload_file" title="Import historique">
      <p
        style={{
          fontSize: '.7rem',
          color: 'var(--t2)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        Colle un tableau JSON. Les dates existantes sont écrasées, la phase se
        remplit manuellement dans le Journal des pesées.
      </p>

      <details style={{ fontSize: '.68rem', color: 'var(--t2)' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--acc)' }}>
          Format attendu
        </summary>
        <div style={{ marginTop: 6, lineHeight: 1.6 }}>
          <code>date</code> — ISO <code>AAAA-MM-JJ</code> (requis)
          <br />
          <code>weight</code> — kg (optionnel)
          <br />
          <code>targetKcal</code> — palier kcal (optionnel)
          <br />
          <code>realKcal</code> — kcal consommées (optionnel)
          <br />
          <code>steps</code> — entier, 0 accepté (optionnel)
          <br />
          <code>workout</code> — booléen, séance on/off (optionnel)
        </div>
        <pre
          style={{
            marginTop: 8,
            padding: 10,
            background: 'var(--b2)',
            borderRadius: 8,
            border: '1px solid var(--l1)',
            overflowX: 'auto',
            fontFamily: 'JetBrains Mono',
            fontSize: '.6rem',
            color: 'var(--t2)',
            whiteSpace: 'pre',
          }}
        >
          {EXAMPLE}
        </pre>
      </details>

      <textarea
        className="inp"
        placeholder='[{"date":"2026-04-17","weight":74.3,...}]'
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={6}
        spellCheck={false}
        style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '.7rem',
          resize: 'vertical',
          minHeight: 120,
        }}
      />

      <button
        type="button"
        className="btn btn-p"
        onClick={handleImport}
        disabled={busy || raw.trim().length === 0}
        style={{ width: '100%' }}
      >
        <span className="material-symbols-outlined">upload</span>
        Importer
      </button>
    </SettingsSection>
  );
}
