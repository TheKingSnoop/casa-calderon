"use client";

import { useState } from "react";
import { decodeEmail } from "@/lib/format";

/**
 * Email link without the address in the page's HTML (NFR-6). The server
 * renders an encoded value, and the address is decoded only when a visitor
 * clicks "Show email". Scrapers that read the HTML never see it.
 */
export function EmailLink({
  encoded,
  className,
}: {
  encoded: string;
  className?: string;
}) {
  const [email, setEmail] = useState<string | null>(null);

  if (!email) {
    return (
      <button
        type="button"
        className={`${className ?? ""} cursor-pointer`}
        onClick={() => setEmail(decodeEmail(encoded))}
      >
        Show email
      </button>
    );
  }
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
