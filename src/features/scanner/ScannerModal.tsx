import { useCallback, useState, type FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import { useBarcodeScanner } from './useBarcodeScanner';
import { lookupBarcode } from './openFoodFacts';
import { getAllFoods } from '@/features/nutrition/foodSearch';
import { useNutritionStore } from '@/store/useNutritionStore';
import { toast } from '@/components/ui/toastStore';
import type { BarcodeEntry, FoodTuple } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onProductResolved: (name: string, tuple: FoodTuple) => void;
}

function vibrate(ms: number) {
  if (navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* noop */
    }
  }
}

export default function ScannerModal({
  open,
  onClose,
  onProductResolved,
}: Props) {
  const barcodes = useNutritionStore((s) => s.barcodes);
  const recipes = useNutritionStore((s) => s.recipes);
  const setBarcodes = useNutritionStore((s) => s.setBarcodes);

  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCode = useCallback(
    async (code: string) => {
      if (busy) return;
      vibrate(60);

      const cached = barcodes[code];
      if (cached) {
        const tuple: FoodTuple = [
          cached.kcal,
          cached.p,
          cached.g,
          cached.l,
          cached.f ?? 0,
        ];
        onProductResolved(cached.name, tuple);
        onClose();
        return;
      }

      setBusy(true);
      const allFoods = getAllFoods(recipes, barcodes);
      const names = new Set(Object.keys(allFoods));
      const result = await lookupBarcode(code, names);
      setBusy(false);

      if (!result.ok) {
        const msg =
          result.reason === 'not_found'
            ? `Produit introuvable (${code})`
            : result.reason === 'no_nutrition'
              ? 'Produit trouvé mais sans valeurs nutritionnelles'
              : 'Erreur réseau, réessaie';
        toast(msg, 'warn');
        return;
      }

      const entry: BarcodeEntry = { ...result.entry };
      setBarcodes({ ...barcodes, [code]: entry });
      const tuple: FoodTuple = [
        entry.kcal,
        entry.p,
        entry.g,
        entry.l,
        entry.f ?? 0,
      ];
      toast(`${entry.name} ajouté`, 'success');
      onProductResolved(entry.name, tuple);
      onClose();
    },
    [barcodes, busy, onClose, onProductResolved, recipes, setBarcodes],
  );

  const { videoRef, state } = useBarcodeScanner({
    enabled: open,
    onCodeFound: handleCode,
  });

  const handleManualSubmit = (event: FormEvent) => {
    event.preventDefault();
    const v = manualCode.trim().replace(/\s/g, '');
    if (!/^\d{6,14}$/.test(v)) {
      setManualError(true);
      setTimeout(() => setManualError(false), 700);
      return;
    }
    setManualCode('');
    handleCode(v);
  };

  const messageColor =
    state.status === 'error' ||
    state.status === 'unsupported' ||
    state.status === 'denied'
      ? 'var(--red)'
      : 'var(--t2)';

  return (
    <Modal open={open} onClose={onClose}>
      <h3>📷 Scanner un code-barres</h3>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          background: '#000',
          borderRadius: 'var(--r)',
          overflow: 'hidden',
          marginTop: 8,
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '15% 10%',
            border: '2px solid var(--acc)',
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,.35)',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div
        style={{
          margin: '10px 0 6px',
          fontSize: '.78rem',
          textAlign: 'center',
          minHeight: '1.2em',
          color: messageColor,
        }}
      >
        {busy ? 'Recherche…' : state.message}
      </div>
      <form
        onSubmit={handleManualSubmit}
        style={{ display: 'flex', gap: 6, marginTop: 4 }}
      >
        <input
          type="text"
          inputMode="numeric"
          className="inp"
          placeholder="Ou saisis le code"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          style={{
            flex: 1,
            borderColor: manualError ? 'var(--red)' : undefined,
          }}
        />
        <button type="submit" className="btn btn-p btn-sm">
          OK
        </button>
      </form>
      <button
        type="button"
        className="btn btn-o"
        onClick={onClose}
        style={{ width: '100%', marginTop: 10 }}
      >
        Fermer
      </button>
    </Modal>
  );
}
