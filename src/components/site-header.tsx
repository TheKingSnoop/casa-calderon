import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Logo } from "./logo";
import { NavLink } from "./nav-link";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
        >
          <Logo size={40} />
          {siteConfig.name}
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          <li>
            <NavLink href="/projects/">Projects</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
