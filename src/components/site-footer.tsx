import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  // Evaluated at build time (static export); a yearly rebuild keeps it current.
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-muted">
        © {year} {siteConfig.name}. Built by the Calderon Patiño family.
      </div>
    </footer>
  );
}
