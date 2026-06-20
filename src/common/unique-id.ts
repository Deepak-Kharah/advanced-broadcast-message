export function uniqueId(prefix?: string) {
  const suffix = crypto.randomUUID();
  return prefix ? `${prefix}-${suffix}` : suffix;
}
