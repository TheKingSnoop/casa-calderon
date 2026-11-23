import Link from "next/link";
import type { Member } from "@/lib/content";
import { Avatar } from "./avatar";
import { DraftBadge } from "./badges";

export function MemberCard({ member }: { member: Member }) {
  return (
    <article className="relative flex flex-col items-center gap-3 rounded-lg border border-border p-6 text-center transition-colors hover:border-accent">
      <Avatar name={member.name} src={member.avatar} size={80} />
      <h3 className="text-lg font-semibold">
        {/* Whole card clickable via the ::after overlay, one link for screen readers. */}
        <Link
          href={`/members/${member.slug}/`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {member.name}
        </Link>
      </h3>
      <p className="text-sm text-muted">{member.role}</p>
      {member.tagline && <p className="text-sm">{member.tagline}</p>}
      <DraftBadge published={member.published} />
    </article>
  );
}
