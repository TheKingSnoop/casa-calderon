import Link from "next/link";
import type { Member, Space } from "@/lib/content";

const SPACE_LABELS: Record<Space, string> = {
  kitchen: "Kitchen",
};

/**
 * Tabs across a member's hub (FR-42, ADR-0006): their profile plus each space
 * they've switched on. Real links (each space is its own page), so they work
 * without JavaScript and can be shared. Hidden for members without spaces.
 */
export function MemberTabs({
  member,
  current,
}: {
  member: Member;
  current: "profile" | Space;
}) {
  const spaces = member.spaces ?? [];
  if (spaces.length === 0) return null;

  const tabs = [
    { id: "profile", label: "Profile", href: `/members/${member.slug}/` },
    ...spaces.map((space) => ({
      id: space,
      label: SPACE_LABELS[space],
      href: `/members/${member.slug}/${space}/`,
    })),
  ];
  const firstName = member.name.split(" ")[0];

  return (
    <nav
      aria-label={`${firstName}'s spaces`}
      className="mt-8 overflow-x-auto border-b border-border"
    >
      <ul className="flex gap-6">
        {tabs.map((tab) => {
          const isCurrent = tab.id === current;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`-mb-px inline-block border-b-2 px-1 py-3 font-medium whitespace-nowrap ${
                  isCurrent
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Compact member header for space pages (the profile has the full one) */
export function MemberMasthead({ member }: { member: Member }) {
  return (
    <p className="text-sm text-muted">
      <Link
        href={`/members/${member.slug}/`}
        className="font-medium text-foreground underline-offset-2 hover:underline"
      >
        {member.name}
      </Link>{" "}
      · {member.role}
    </p>
  );
}
