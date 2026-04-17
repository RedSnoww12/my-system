import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import {
  buildMacroDonut,
  type MacroRange,
} from '@/features/analysis/charts/macroAverages';
import { todayISO } from '@/lib/date';
import { useNutritionStore } from '@/store/useNutritionStore';

interface Props {
  range: MacroRange;
}

export default function MacroDonutChart({ range }: Props) {
  const log = useNutritionStore((s) => s.log);
  const today = todayISO();

  const built = useMemo(
    () => buildMacroDonut({ log, today, range }),
    [log, today, range],
  );

  const hasData = built.slices.some((s) => s.value > 0);
  const data = hasData
    ? built.slices
    : [{ key: 'empty', value: 1, color: 'var(--l1)' }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="62%"
          outerRadius="100%"
          strokeWidth={0}
          isAnimationActive={false}
        >
          {data.map((slice, i) => (
            <Cell key={i} fill={slice.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
