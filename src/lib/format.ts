// A fixed list instead of Intl.DateTimeFormat: ICU versions disagree
// (en-GB gives "Sept" on some, "Sep" on others), and the output must be
// identical on every machine and in CI.
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-11" or "2026-11-01" → "Nov 2026" */
export function formatMonth(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/**
 * ("2024-09", undefined) → "Sep 2024 – Present"
 * (undefined, "2015-07") → "Jul 2015" (a single date, e.g. a graduation)
 */
export function formatPeriod(start?: string, end?: string): string {
  if (!start) return end ? formatMonth(end) : "";
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

/** "Israel Calderon" → "IC"; "Marcy" → "M" */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Light email obfuscation (NFR-6): the address isn't present as plain text in
 * the HTML, which defeats simple scrapers. The browser decodes it (see
 * EmailLink). Not encryption: anyone determined can still read it.
 */
export function encodeEmail(email: string): string {
  return Buffer.from([...email].reverse().join(""), "utf8").toString("base64");
}

export function decodeEmail(encoded: string): string {
  // atob is available in browsers and in Node 16+.
  return [...atob(encoded)].reverse().join("");
}

/** "https://www.github.com/ana/" → "github.com/ana" (for link labels) */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
