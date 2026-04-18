import { useTweenInt } from '@/hooks/useTween';
import type { Macros, Targets } from '@/types';

interface MacroBarProps {
  letter: string;
  name: string;
  current: number;
  target: number;
  color: string;
}

function MacroBar({ letter, name, current, target, color }: MacroBarProps) {
  const value = Math.round(current);
  const valueRef = useTweenInt<HTMLSpanElement>(value, 450);
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="kl-macro-row">
      <span className="kl-macro-letter" style={{ color }}>
        {letter}
      </span>
      <span className="kl-macro-name">{name}</span>
      <div className="kl-macro-bw">
        <div
          className="kl-macro-bf"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
      <span className="kl-macro-val">
        <span ref={valueRef} className="kl-macro-cur">
          {value}
        </span>
        <span className="kl-macro-tgt">/{target}</span>
      </span>
    </div>
  );
}

interface Props {
  totals: Macros;
  targets: Targets;
}

export default function MacroRow({ totals, targets }: Props) {
  const inRange =
    totals.p >= targets.prot * 0.6 &&
    totals.p <= targets.prot * 1.2 &&
    totals.g <= targets.gluc * 1.2 &&
    totals.l <= targets.lip * 1.2;

  return (
    <section className="kl-macros">
      <div className="kl-macros-head">
        <span className="kl-macros-lbl">MACROS · g</span>
        <span
          className={`kl-macros-state ${inRange ? 'ok' : 'off'}`}
          aria-hidden
        >
          <span className="kl-macros-state-dot" />
          {inRange ? 'IN RANGE' : 'OFF RANGE'}
        </span>
      </div>
      <div className="kl-macros-grid">
        <MacroBar
          letter="P"
          name="Prot"
          current={totals.p}
          target={targets.prot}
          color="var(--acc)"
        />
        <MacroBar
          letter="G"
          name="Gluc"
          current={totals.g}
          target={targets.gluc}
          color="var(--cyan)"
        />
        <MacroBar
          letter="L"
          name="Lip"
          current={totals.l}
          target={targets.lip}
          color="var(--pnk)"
        />
        <MacroBar
          letter="F"
          name="Fib"
          current={totals.f ?? 0}
          target={targets.fib || 30}
          color="var(--org)"
        />
      </div>
    </section>
  );
}
