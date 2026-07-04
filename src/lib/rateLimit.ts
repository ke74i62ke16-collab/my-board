const _rateMap = new Map<string, number[]>();

export function checkRateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const prev = (_rateMap.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (prev.length >= limit) return false;
  prev.push(now);
  _rateMap.set(ip, prev);
  return true;
}
