import type { SportCategory } from '@/types';

interface Props {
  value: SportCategory;
  onChange: (next: SportCategory) => void;
}

interface CategoryMeta {
  key: SportCategory;
  label: string;
  icon: string;
  color: string;
}

const CATEGORIES: readonly CategoryMeta[] = [
  { key: 'muscu', label: 'Muscu', icon: 'fitness_center', color: 'var(--acc)' },
  {
    key: 'cardio',
    label: 'Cardio',
    icon: 'directions_run',
    color: 'var(--cyan)',
  },
  { key: 'sport', label: 'Sport', icon: 'sports_soccer', color: 'var(--org)' },
  { key: 'combat', label: 'Combat', icon: 'sports_mma', color: 'var(--pnk)' },
];

export default function SportTypeSelector({ value, onChange }: Props) {
  return (
    <div className="kl-sport-cats">
      {CATEGORIES.map((c) => {
        const on = c.key === value;
        return (
          <button
            key={c.key}
            type="button"
            className={`kl-sport-cat ${on ? 'on' : ''}`}
            style={
              {
                '--cat-color': c.color,
              } as React.CSSProperties
            }
            onClick={() => onChange(c.key)}
            aria-pressed={on}
          >
            <span className="material-symbols-outlined kl-sport-cat-ico">
              {c.icon}
            </span>
            <span className="kl-sport-cat-label">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
