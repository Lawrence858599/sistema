export function createOrderNumber(now = new Date(), randomChunk?: number) {
  const stamp = now.toISOString().replace(/\D/g, "").slice(2, 10);
  const suffix = `${randomChunk ?? Math.floor(100 + Math.random() * 900)}`.padStart(3, "0");
  return `LUME-${stamp}-${suffix}`;
}
