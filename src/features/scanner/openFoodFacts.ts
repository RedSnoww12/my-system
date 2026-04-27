import type { BarcodeEntry } from '@/types';

const OFF_HOST = 'https://world.openfoodfacts.org';
const OFF_V2 = `${OFF_HOST}/api/v2/product`;
const OFF_V0 = `${OFF_HOST}/api/v0/product`;
const OFF_FIELDS = 'product_name,brands,nutriments,code';
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAYS_MS = [800, 2000];

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

export type LookupFailureReason =
  | 'not_found'
  | 'no_nutrition'
  | 'timeout'
  | 'offline'
  | 'server'
  | 'network';

export type LookupResult =
  | { ok: true; entry: BarcodeEntry }
  | { ok: false; reason: LookupFailureReason };

type FetchOutcome =
  | { kind: 'ok'; data: OffResponse }
  | { kind: 'not_found' }
  | { kind: 'fail'; reason: 'timeout' | 'offline' | 'server' | 'network' };

function round1(v: number): number {
  return +(v ?? 0).toFixed(1);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOff(
  url: string,
  signal: AbortSignal,
): Promise<FetchOutcome> {
  let response: Response;
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { kind: 'fail', reason: 'timeout' };
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { kind: 'fail', reason: 'offline' };
    }
    return { kind: 'fail', reason: 'network' };
  }

  if (response.status === 404) return { kind: 'not_found' };
  if (response.status >= 500) return { kind: 'fail', reason: 'server' };
  if (!response.ok) return { kind: 'fail', reason: 'network' };

  try {
    const data = (await response.json()) as OffResponse;
    return { kind: 'ok', data };
  } catch {
    return { kind: 'fail', reason: 'network' };
  }
}

async function fetchWithTimeout(url: string): Promise<FetchOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetchOff(url, controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOffWithRetry(url: string): Promise<FetchOutcome> {
  let last: FetchOutcome = { kind: 'fail', reason: 'network' };
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    last = await fetchWithTimeout(url);
    if (last.kind === 'ok' || last.kind === 'not_found') return last;
    if (last.reason === 'offline') return last;
    if (attempt < RETRY_DELAYS_MS.length) {
      await delay(RETRY_DELAYS_MS[attempt]);
    }
  }
  return last;
}

function isProductFound(data: OffResponse): boolean {
  return data.status === 1 && !!data.product;
}

function buildEntry(
  ean: string,
  product: OffProduct,
  existingNames: Set<string>,
): LookupResult {
  const n: OffNutriments = product.nutriments ?? {};
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

  const brand = (product.brands ?? '').split(',')[0].trim();
  const baseRaw =
    `${brand ? brand + ' ' : ''}${product.product_name ?? `Produit ${ean}`}`.trim();
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

  return { ok: true, entry: { name: finalName, kcal, p, g, l, f } };
}

function failureFromOutcome(outcome: FetchOutcome): LookupFailureReason {
  if (outcome.kind === 'not_found') return 'not_found';
  if (outcome.kind === 'fail') return outcome.reason;
  return 'network';
}

export async function lookupBarcode(
  ean: string,
  existingNames: Set<string>,
): Promise<LookupResult> {
  const code = encodeURIComponent(ean);
  const v2Url = `${OFF_V2}/${code}.json?fields=${OFF_FIELDS}`;
  const v0Url = `${OFF_V0}/${code}.json`;

  const v2 = await fetchOffWithRetry(v2Url);
  if (v2.kind === 'ok' && isProductFound(v2.data)) {
    return buildEntry(ean, v2.data.product as OffProduct, existingNames);
  }

  const v2NotFound =
    v2.kind === 'not_found' || (v2.kind === 'ok' && !isProductFound(v2.data));
  if (v2NotFound) {
    const v0 = await fetchOffWithRetry(v0Url);
    if (v0.kind === 'ok' && isProductFound(v0.data)) {
      return buildEntry(ean, v0.data.product as OffProduct, existingNames);
    }
    if (v0.kind === 'fail') {
      return { ok: false, reason: v0.reason };
    }
    return { ok: false, reason: 'not_found' };
  }

  return { ok: false, reason: failureFromOutcome(v2) };
}
