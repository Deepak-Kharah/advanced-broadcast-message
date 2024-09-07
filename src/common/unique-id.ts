export function uniqueId(prefix?: string) {
  const suffix = crypto.randomUUID().split("-")[0];
  return prefix ? `${prefix}-${suffix}` : suffix;
}
