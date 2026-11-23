"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Header link that marks the current section with aria-current="page". */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  // Compare without trailing slashes: with `trailingSlash: true`, the browser
  // URL is "/projects/" but usePathname() may report "/projects".
  const path = stripSlash(usePathname());
  const target = stripSlash(href);
  // Current for the section itself and anything below it (/projects/x/).
  const current = path === target || path.startsWith(`${target}/`);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={
        current
          ? "font-medium text-foreground underline underline-offset-4"
          : "text-muted hover:text-foreground"
      }
    >
      {children}
    </Link>
  );
}

function stripSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}
