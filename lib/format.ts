export function prettyKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\bcve\b/gi, "CVE")
    .replace(/\bcvss\b/gi, "CVSS")
    .replace(/\bip\b/gi, "IP")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString([], {
    year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export function fmtMs(ms: number | null): string {
  if (!ms) return "—";
  return fmtTime(new Date(ms).toISOString());
}

export function assetSummary(assets: { name: string; ip?: string | null }[]): string {
  if (!assets.length) return "—";
  const first = assets[0];
  const head = first.ip && first.ip !== first.name ? `${first.name} (${first.ip})` : first.name;
  return assets.length === 1 ? head : `${head} +${assets.length - 1} more`;
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
