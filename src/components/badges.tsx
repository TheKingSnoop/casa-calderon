import type { ReactNode } from "react";

/** Small pill label, e.g. "Professional", "Confidential", "Available for freelance". */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

/**
 * Shown on unpublished content. Drafts only ever render in local development
 * (or with SHOW_DRAFTS=true), never on the live site, so this badge is a
 * reminder that the owner hasn't signed off yet (NFR-6).
 */
export function DraftBadge({ published }: { published: boolean }) {
  if (published) return null;
  return (
    <span
      className="inline-flex items-center rounded-full bg-draft-background px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-draft"
      title="Not published: hidden on the live site until its owner sets published: true"
    >
      Draft
    </span>
  );
}

export function TagList({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md bg-surface px-2 py-1 text-sm text-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
