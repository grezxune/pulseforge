/** Formats large numbers in a compact, readable way for the global counter. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.floor(value)));
}
