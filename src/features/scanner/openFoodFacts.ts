import type { BarcodeEntry } from '@/types';

const OFF_ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product';
const OFF_FIELDS = 'product_name,brands,nutriments,code';

interface OffNutriments {
  'energy-kcal_100g'?: number;
  energy_kcal_100g?: number;
  energy_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
}

interface OffProduct {
  product_name?: string;
  brands?: string;
  nutriments?: OffNutriments;
}

interface OffResponse {
  status: number;
  product?: OffProduct;
}

export type LookupResult =
  | { ok: true; entry: BarcodeEntry }
  | { ok: false; reason: 'not_found' | 'no_nutrition' | 'network' };

function round1(v: number): number {
  return +(v ?? 0).toFixed(1);
}

export async function lookupBarcode(
  ean: string,
  existingNames: Set<string>,
): Promise<LookupResult> {
  try {
    const url = `${OFF_ENDPOINT}/${encodeURIComponent(ean)}.json?fields=${OFF_FIELDS}`;
    const r = await fetch(url);
    if (!r.ok) return { ok: false, reason: 'network' };
    const j = (await r.json()) as OffResponse;
    if (j.status !== 1 || !j.product) return { ok: false, reason: 'not_found' };

    const prod = j.product;
    const n: OffNutriments = prod.nutriments ?? {};
    const kcal = Math.round(
      n['energy-kcal_100g'] ??
        n.energy_kcal_100g ??
        (n.energy_100g ? n.energy_100g / 4.184 : 0),
    );
    const p = round1(n.proteins_100g ?? 0);
    const g = round1(n.carbohydrates_100g ?? 0);
    const l = round1(n.fat_100g ?? 0);
    const f = round1(n.fiber_100g ?? 0);

    if (kcal <= 0 && p <= 0 && g <= 0 && l <= 0) {
      return { ok: false, reason: 'no_nutrition' };
    }

    const brand = (prod.brands ?? '').split(',')[0].trim();
    const baseRaw =
      `${brand ? brand + ' ' : ''}${prod.product_name ?? `Produit ${ean}`}`.trim();
    const base = baseRaw.length > 50 ? baseRaw.slice(0, 50) : baseRaw;

    let finalName = base;
    let i = 2;
    while (existingNames.has(finalName) && finalName !== base) {
      finalName = `${base} (${i})`;
      i++;
    }
    while (existingNames.has(finalName)) {
      finalName = `${base} (${i})`;
      i++;
    }

    return {
      ok: true,
      entry: { name: finalName, kcal, p, g, l, f },
    };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
