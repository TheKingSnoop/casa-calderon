/**
 * Security headers: single source of truth.
 *
 * Used by:
 * - the CloudFront response headers policy (site-stack.ts), i.e. production
 * - scripts/serve-static.ts, the local server the end-to-end tests run
 *   against, so a CSP that would break the site fails a test before deploy
 *
 * Plain values only (no CDK imports), so the website side can import it too.
 */

// 'unsafe-inline' for scripts is needed because Next.js static export
// inlines small bootstrap scripts and we have no server to add nonces.
export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** HSTS max-age: 1 year */
export const hstsMaxAgeSeconds = 365 * 24 * 60 * 60;

export const referrerPolicy = "strict-origin-when-cross-origin";

export const permissionsPolicy = "camera=(), microphone=(), geolocation=()";
