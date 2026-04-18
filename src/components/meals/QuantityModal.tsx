import { useEffect, useState, type FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import { sanitizeDecimal } from '@/lib/numericInput';
import type { FoodTuple } from '@/types';

interface Props {
  open: boolean;
  food: string | null;
  tuple: FoodTuple | null;
  initialQty?: number;
  onClose: () => void;
  onConfirm: (qty: number) => void;
}

export default function QuantityModal({
  open,
  food,
  tuple,
  initialQty = 100,
  onClose,
  onConfirm,
}: Props) {
  const [qty, setQty] = useState(String(initialQty));

  useEffect(() => {
    if (open) setQty(String(initialQty));
  }, [open, initialQty]);

  if (!food || !tuple) return null;

  const [kcal, p, g, l, f] = tuple;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseFloat(qty.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onConfirm(parsed);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3>{food}</h3>
      <div className="fp mono">
        Pour 100g : {kcal} kcal | P{p} G{g} L{l} Fib{f ?? 0}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="decimal"
          className="inp"
          autoFocus
          value={qty}
          onChange={(e) => setQty(sanitizeDecimal(e.target.value))}
          placeholder="Quantité (g)"
          style={{ width: '100%' }}
        />
        <div className="acts">
          <button type="button" className="btn btn-o" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn-p">
            Ajouter
          </button>
        </div>
      </form>
    </Modal>
  );
}
