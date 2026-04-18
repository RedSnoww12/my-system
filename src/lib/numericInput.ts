export function sanitizeDecimal(v: string): string {
  const cleaned = v.replace(/[^\d.,]/g, '');
  const sepIdx = cleaned.search(/[.,]/);
  if (sepIdx === -1) return cleaned;
  const head = cleaned.slice(0, sepIdx);
  const sep = cleaned[sepIdx];
  const tail = cleaned.slice(sepIdx + 1).replace(/[.,]/g, '');
  return head + sep + tail;
}

export function sanitizeInteger(v: string): string {
  return v.replace(/\D/g, '');
}
