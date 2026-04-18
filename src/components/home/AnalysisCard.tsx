import { useSettingsStore } from '@/store/useSettingsStore';
import type { HomeAnalysis } from '@/features/analysis/home-analysis';
import type { WeightStats } from '@/types';

interface Props {
  analysis: HomeAnalysis;
  stats: WeightStats | null;
}

function rateColor(rate: number): string {
  if (rate < 0) return 'var(--acc)';
  if (rate > 0) return 'var(--red)';
  return 'var(--t1)';
}

const VARIANT_META: Record<
  HomeAnalysis['variant'],
  { tag: string; color: string; bg: string }
> = {
  increase: { tag: 'TREND ↑', color: 'var(--acc)', bg: 'var(--grnG)' },
  decrease: { tag: 'TREND ↓', color: 'var(--org)', bg: 'var(--orgG)' },
  maintain: { tag: 'STABLE', color: 'var(--cyan)', bg: 'var(--cyanG)' },
};

export default function AnalysisCard({ analysis, stats }: Props) {
  const targets = useSettingsStore((s) => s.targets);
  const setTargets = useSettingsStore((s) => s.setTargets);

  const applyDelta = (delta: number) => {
    const nextGluc = Math.max(0, targets.gluc + delta);
    const nextKcal = targets.prot * 4 + nextGluc * 4 + targets.lip * 9;
    setTargets({ ...targets, gluc: nextGluc, kcal: nextKcal });
  };

  const meta = VARIANT_META[analysis.variant];

  const subBits: string[] = [];
  if (analysis.trend && analysis.trend.dir !== 'observing') {
    subBits.push(`trend ${analysis.trend.window}j`);
    subBits.push(`conf ${analysis.trend.confidence}`);
    if (analysis.trend.adherence !== null) {
      subBits.push(`adh ${analysis.trend.adherence}%`);
    }
  }

  const ctaDelta =
    analysis.variant === 'increase'
      ? 50
      : analysis.variant === 'decrease'
        ? -50
        : 0;

  return (
    <section className="kl-analysis">
      <div className="kl-analysis-head">
        <div className="kl-analysis-head-l">
          <div
            className="kl-analysis-ico"
            style={{ background: meta.bg }}
            aria-hidden
          >
            <span
              className="material-symbols-outlined"
              style={{ color: meta.color, fontSize: 18 }}
            >
              analytics
            </span>
          </div>
          <div>
            <div className="kl-analysis-title">Analyse du Lab</div>
            {subBits.length > 0 && (
              <div className="kl-analysis-sub">{subBits.join(' · ')}</div>
            )}
          </div>
        </div>
        <span
          className="kl-analysis-pill"
          style={{ color: meta.color, background: meta.bg }}
        >
          {meta.tag}
        </span>
      </div>

      {analysis.headline && (
        <div className="kl-analysis-quote">
          «&nbsp;{analysis.headline}&nbsp;»
        </div>
      )}

      {ctaDelta !== 0 && (
        <button
          type="button"
          className="kl-analysis-cta"
          onClick={() => applyDelta(ctaDelta)}
        >
          Appliquer la recommandation
        </button>
      )}

      <div className="kl-analysis-grid">
        <div className="kl-stat-cell">
          <div className="kl-stat-lbl">MOY KCAL {analysis.winDays}J</div>
          <div className="kl-stat-val" style={{ color: 'var(--org)' }}>
            {analysis.avgKcal}
          </div>
        </div>
        <div className="kl-stat-cell">
          <div className="kl-stat-lbl">MOY PROT</div>
          <div className="kl-stat-val" style={{ color: 'var(--acc)' }}>
            {analysis.avgProt}g
          </div>
        </div>
        <div className="kl-stat-cell">
          <div className="kl-stat-lbl">ÉVOL {analysis.winDays}J</div>
          <div
            className="kl-stat-val"
            style={{ color: rateColor(analysis.weightChange) }}
          >
            {analysis.weightChange > 0 ? '+' : ''}
            {analysis.weightChange.toFixed(1)}kg
          </div>
        </div>
        <div className="kl-stat-cell">
          <div className="kl-stat-lbl">TRACKÉS</div>
          <div className="kl-stat-val">
            {analysis.trackedDays}/{analysis.winDays}
          </div>
        </div>
      </div>

      {stats && stats.count >= 2 && (
        <div className="kl-analysis-grid">
          <div className="kl-stat-cell">
            <div className="kl-stat-lbl">MOY 7J</div>
            <div className="kl-stat-val" style={{ color: 'var(--acc)' }}>
              {stats.avg7}
            </div>
          </div>
          <div className="kl-stat-cell">
            <div className="kl-stat-lbl">MOY 30J</div>
            <div className="kl-stat-val" style={{ color: 'var(--pur)' }}>
              {stats.avg30}
            </div>
          </div>
          <div className="kl-stat-cell">
            <div className="kl-stat-lbl">RYTHME</div>
            <div
              className="kl-stat-val"
              style={{ color: rateColor(stats.rate) }}
            >
              {stats.rate > 0 ? '+' : ''}
              {stats.rate}/sem
            </div>
          </div>
          <div className="kl-stat-cell">
            <div className="kl-stat-lbl">
              {stats.estDays ? 'OBJECTIF' : 'RÉGULARITÉ'}
            </div>
            <div className="kl-stat-val" style={{ color: 'var(--org)' }}>
              {stats.estDays ? `~${stats.estDays}j` : `${stats.reg}%`}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
