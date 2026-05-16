const rawUpiIds = process.env.EXPO_PUBLIC_UPI_IDS || process.env.EXPO_PUBLIC_UPI_ID || '';

export const UPI_NAME = process.env.EXPO_PUBLIC_UPI_NAME || 'Dynamic Bazar';
export const UPI_IDS = rawUpiIds
  .split(',')
  .map((value: string) => value.trim())
  .filter(Boolean);

export function pickUpiId(seed: string): string {
  if (!UPI_IDS.length) return '';
  const index = Math.abs(hashSeed(seed || String(Date.now()))) % UPI_IDS.length;
  return UPI_IDS[index];
}

export function buildUpiPaymentUrl({ upiId, payeeName, amount, note }: { upiId: string; payeeName: string; amount: number; note: string }) {
  const params = [
    ['pa', upiId],
    ['pn', payeeName],
    ['am', amount.toFixed(2)],
    ['cu', 'INR'],
    ['tn', note],
  ];
  return `upi://pay?${params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
