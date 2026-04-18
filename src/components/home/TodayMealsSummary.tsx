import { MEAL_LABELS } from '@/data/constants';
import { groupByMeal } from '@/features/nutrition/totals';
import type { MealEntry } from '@/types';

interface Props {
  entries: MealEntry[];
}

const SLOT_COLORS = ['var(--yel)', 'var(--org)', 'var(--pnk)', 'var(--pur)'];

export default function TodayMealsSummary({ entries }: Props) {
  const total = entries.reduce((s, i) => s + i.kcal, 0);
  const grouped = groupByMeal(entries);
  const slotKeys = [0, 1, 2, 3] as const;

  return (
    <section className="kl-meals">
      <div className="kl-meals-head">
        <div className="kl-meals-head-l">
          <span className="kl-meals-head-bar" aria-hidden />
          <span className="kl-meals-lbl">REPAS · JOURNAL</span>
        </div>
        {entries.length > 0 && (
          <span className="kl-meals-total">
            {Math.round(total)} <span className="kl-meals-total-u">kcal</span>
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="kl-meals-empty">
          ▸ Aucun repas aujourd'hui — commence par un petit-déj
        </div>
      ) : (
        slotKeys.map((slot, idx) => {
          const items = grouped[slot] ?? [];
          const sum = items.reduce((s, e) => s + e.kcal, 0);
          const color = SLOT_COLORS[slot];
          return (
            <div
              key={slot}
              className={`kl-meals-slot ${idx > 0 ? 'divider' : ''}`}
            >
              <div className="kl-meals-slot-head">
                <div className="kl-meals-slot-head-l">
                  <span
                    className="kl-meals-dot"
                    style={{
                      background: color,
                      boxShadow: `0 0 6px ${color}`,
                    }}
                    aria-hidden
                  />
                  <span className="kl-meals-slot-name">
                    {MEAL_LABELS[slot]}
                  </span>
                </div>
                <span
                  className="kl-meals-slot-kcal"
                  style={{
                    color: sum ? 'var(--t1)' : 'var(--t3)',
                  }}
                >
                  {sum || '—'}
                  <span className="kl-meals-slot-u"> kcal</span>
                </span>
              </div>
              {items.map((e) => (
                <div key={e.id} className="kl-meals-entry">
                  <span className="kl-meals-entry-name">
                    {e.food}
                    {e.qty !== undefined && (
                      <span className="kl-meals-entry-qty"> · {e.qty}g</span>
                    )}
                  </span>
                  <span className="kl-meals-entry-kcal">{e.kcal}</span>
                </div>
              ))}
            </div>
          );
        })
      )}
    </section>
  );
}
