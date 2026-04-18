import { useSettingsStore } from '@/store/useSettingsStore';
import type { Recommendation, TrendResult } from '@/types';

interface Props {
  trend: TrendResult;
  recommendation: Recommendation;
}

const TONE_META: Record<
  Recommendation['tp'],
  { tag: string; color: string; bg: string }
> = {
  info: { tag: '[INFO]', color: 'var(--cyan)', bg: 'var(--cyanG)' },
  success: { tag: '[OK]', color: 'var(--acc)', bg: 'var(--grnG)' },
  warn: { tag: '[WARN]', color: 'var(--org)', bg: 'var(--orgG)' },
  danger: { tag: '[ERR]', color: 'var(--red)', bg: 'var(--redG)' },
};

export default function RecommendationAlert({ trend, recommendation }: Props) {
  const targets = useSettingsStore((s) => s.targets);
  const setTargets = useSettingsStore((s) => s.setTargets);

  const handleApply = (delta: number) => {
    const nextGluc = Math.max(0, targets.gluc + Math.round(delta / 4));
    const nextKcal = targets.prot * 4 + nextGluc * 4 + targets.lip * 9;
    setTargets({ ...targets, gluc: nextGluc, kcal: nextKcal });
  };

  const meta = TONE_META[recommendation.tp];

  const subParts: string[] = [];
  if (trend.dir !== 'observing') {
    subParts.push(`fenêtre ${trend.window}j`);
    subParts.push(`conf ${trend.confidence}`);
    if (trend.adherence !== null) {
      subParts.push(`adh ${trend.adherence}%`);
    }
  }

  let action: { label: string; delta: number } | null = null;
  if (recommendation.act === '+200') action = { label: 'Apply', delta: 200 };
  else if (recommendation.act === '-200')
    action = { label: 'Apply', delta: -200 };

  return (
    <div className="kl-alert" style={{ background: meta.bg }}>
      <span
        className="kl-alert-dot"
        style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
        aria-hidden
      />
      <div className="kl-alert-body">
        <span className="kl-alert-tag" style={{ color: meta.color }}>
          {meta.tag}
        </span>
        <span className="kl-alert-msg">{recommendation.msg}</span>
        {subParts.length > 0 && (
          <div className="kl-alert-sub">{subParts.join(' · ')}</div>
        )}
      </div>
      {action && (
        <button
          type="button"
          className="kl-alert-btn"
          onClick={() => handleApply(action.delta)}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
