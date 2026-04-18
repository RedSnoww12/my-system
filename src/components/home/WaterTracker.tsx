import { useTrackingStore } from '@/store/useTrackingStore';

interface Props {
  date: string;
}

const TARGET = 8;

export default function WaterTracker({ date }: Props) {
  const count = useTrackingStore((s) => s.water[date] ?? 0);
  const setWaterForDate = useTrackingStore((s) => s.setWaterForDate);

  const adjust = (delta: number) => {
    const next = Math.max(0, count + delta);
    setWaterForDate(date, next);
  };

  return (
    <div className="kl-bento kl-bento-water">
      <div className="kl-bento-head">
        <span className="kl-bento-lbl">H₂O</span>
        <span
          className="material-symbols-outlined kl-bento-ico"
          style={{ color: 'var(--cyan)' }}
          aria-hidden
        >
          water_drop
        </span>
      </div>
      <div className="kl-bento-val">
        <span className="kl-bento-num">{(count * 0.25).toFixed(1)}</span>
        <span className="kl-bento-unit">L / {(TARGET * 0.25).toFixed(1)}</span>
      </div>
      <div className="kl-bento-pips" aria-hidden>
        {Array.from({ length: TARGET }).map((_, i) => (
          <span key={i} className={`kl-bento-pip ${i < count ? 'on' : ''}`} />
        ))}
      </div>
      <div className="kl-bento-acts">
        <button
          type="button"
          className="kl-bento-btn"
          aria-label="Moins d'eau"
          onClick={() => adjust(-1)}
        >
          −
        </button>
        <button
          type="button"
          className="kl-bento-btn kl-bento-btn--p"
          aria-label="Plus d'eau"
          onClick={() => adjust(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
