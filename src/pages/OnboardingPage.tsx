import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  computeTargetsFromKcal,
  DEFAULT_PROFILE,
  PHASE_NAMES,
} from '@/data/constants';
import type { Phase } from '@/types';

const PHASE_LABELS: Record<Phase, string> = {
  A: `${PHASE_NAMES.A} (x1.0)`,
  B: `${PHASE_NAMES.B} (x0.85)`,
  C: `${PHASE_NAMES.C} (x0.90)`,
  D: `${PHASE_NAMES.D} (x1.075)`,
  E: `${PHASE_NAMES.E} (x0.88)`,
  F: `${PHASE_NAMES.F} (x0.92)`,
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const [weight, setWeight] = useState(String(DEFAULT_PROFILE.startWeight));
  const [height, setHeight] = useState(String(DEFAULT_PROFILE.height));
  const [kcal, setKcal] = useState('2200');
  const [phase, setPhase] = useState<Phase>(DEFAULT_PROFILE.phase);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const w =
      parseFloat(weight.replace(',', '.')) || DEFAULT_PROFILE.startWeight;
    const h = parseInt(height, 10) || DEFAULT_PROFILE.height;
    const k = parseInt(kcal, 10) || 2200;
    const targets = computeTargetsFromKcal(k, w);

    completeOnboarding(
      {
        height: h,
        startWeight: w,
        phase,
        stepsGoal: DEFAULT_PROFILE.stepsGoal,
        activity: DEFAULT_PROFILE.activity,
        theme: DEFAULT_PROFILE.theme,
      },
      targets,
    );

    navigate('/', { replace: true });
  };

  return (
    <form className="ob" onSubmit={handleSubmit}>
      <div className="brand brand-g" style={{ fontSize: '1.8rem' }}>
        Kripy
      </div>
      <p>Configure tes objectifs</p>

      <div className="ob-f">
        <label htmlFor="obW">Poids (kg)</label>
        <input
          id="obW"
          className="inp"
          type="text"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="75"
        />

        <label htmlFor="obH">Taille (cm)</label>
        <input
          id="obH"
          className="inp"
          type="number"
          inputMode="numeric"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="175"
        />

        <label htmlFor="obK">Calories</label>
        <input
          id="obK"
          className="inp"
          type="number"
          inputMode="numeric"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          placeholder="2200"
        />

        <label htmlFor="obPh">Phase</label>
        <select
          id="obPh"
          className="inp"
          value={phase}
          onChange={(e) => setPhase(e.target.value as Phase)}
        >
          {(Object.keys(PHASE_LABELS) as Phase[]).map((key) => (
            <option key={key} value={key}>
              {key} — {PHASE_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-p"
        style={{
          width: '100%',
          maxWidth: 320,
          padding: 14,
          fontSize: '.92rem',
          marginTop: 22,
        }}
      >
        C'est parti
      </button>
    </form>
  );
}
