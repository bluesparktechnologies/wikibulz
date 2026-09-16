export function parsePageParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === "") return 1;
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  return Number.isSafeInteger(page) && page > 0 ? page : null;
}