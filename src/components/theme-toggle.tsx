"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

/**
 * Light/dark toggle. The theme normally follows the visitor's OS setting;
 * clicking switches to the other theme and remembers the choice in
 * localStorage. THEME_INIT_SCRIPT (in the layout's <head>) re-applies a
 * saved choice before the page paints, so there's no flash of the wrong theme.
 */

export const THEME_STORAGE_KEY = "theme";

/** Runs before first paint. Keep it tiny and dependency-free. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

type Theme = "light" | "dark";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** The theme actually showing: the saved choice, else the OS setting. */
function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** Re-render when the <html data-theme> attribute or the OS setting changes. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

export function ThemeToggle() {
  // null while pre-rendering (the server can't know the visitor's theme)
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null);

  // Dev only: React Strict Mode's remount resets <html> to its JSX
  // attributes, wiping the data-theme the inline script set. Re-apply it
  // before paint. A no-op in production (see Next.js guide "Preventing
  // flash before hydration").
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        document.documentElement.dataset.theme = saved;
      }
    } catch {
      // storage unavailable: follow the OS setting
    }
  }, []);

  const toggle = () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / storage blocked: the switch still works for this visit.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      // A pressed "Dark mode" toggle reads correctly in screen readers:
      // "Dark mode, toggle button, pressed / not pressed".
      aria-pressed={theme === null ? undefined : theme === "dark"}
      className="flex size-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground"
    >
      <span className="sr-only">Dark mode</span>
      {/* Icons are swapped by CSS, so the right one shows before React loads. */}
      <SunIcon className="only-dark" />
      <MoonIcon className="only-light" />
    </button>
  );
}

function SunIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
