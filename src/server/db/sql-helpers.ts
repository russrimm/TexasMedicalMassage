/**
 * Build a Postgres text[] literal from a JS string array.
 *
 * Drizzle's `sql` tag binds JS arrays as a ROW value, which Postgres can't cast
 * to `text[]` ("cannot cast type record to text[]"). We sidestep that by
 * sending the array as a plain string in Postgres array literal syntax —
 * `{"Swedish","Deep Tissue"}` — and casting it ourselves.
 */
export function pgTextArray(values: readonly string[]): string {
  return `{${values
    .map((v) => `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(",")}}`;
}
