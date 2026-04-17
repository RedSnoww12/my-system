import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useTweenInt } from '@/hooks/useTween';

interface Props {
  consumed: number;
  target: number;
}

export default function CalorieRing({ consumed, target }: Props) {
  const remaining = Math.max(0, Math.round(target - consumed));
  const valueRef = useTweenInt<HTMLDivElement>(remaining, 520);

  const { data, ringFg, overTarget } = useMemo(() => {
    const pct = target
      ? Math.min(100, Math.round((consumed / target) * 100))
      : 0;
    const over = consumed > target;

    const fg = over ? 'var(--red)' : pct > 85 ? 'var(--org)' : 'var(--grn)';
    const bg = 'var(--l1)';

    return {
      overTarget: over,
      ringFg: fg,
      data: over
        ? [{ v: 100, fill: fg }]
        : [
            { v: pct, fill: fg },
            { v: 100 - pct, fill: bg },
          ],
    };
  }, [consumed, target]);

  return (
    <section className="cal-hero">
      <div className="cal-ring">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="v"
              innerRadius="88%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
              isAnimationActive
              cornerRadius={999}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="cal-ctr">
          <div
            ref={valueRef}
            className="cv"
            style={{ color: overTarget ? 'var(--red)' : 'var(--t1)' }}
          >
            {remaining}
          </div>
          <div className="cl">Restantes (kcal)</div>
          <div className="cs" style={{ color: ringFg }}>
            {Math.round(consumed)} / {target} kcal
          </div>
        </div>
      </div>
    </section>
  );
}
