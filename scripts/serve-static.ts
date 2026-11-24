/**
 * Tiny static file server for the end-to-end tests. It mimics production
 * (CloudFront + the url-rewrite function + the response headers policy):
 *
 *   /path/          -> /path/index.html
 *   /path?x=1       -> 301 to /path/?x=1  (query string kept)
 *   missing files   -> /404.html with status 404
 *   every response  -> the production security headers, including the CSP
 *
 * Usage: tsx scripts/serve-static.ts <dir> <port>
 * No dependencies, test use only: never deploy this.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import * as path from "node:path";
import * as headers from "../infra/lib/security-headers";

const [dirArg, portArg] = process.argv.slice(2);
if (!dirArg || !portArg) {
  console.error("Usage: tsx scripts/serve-static.ts <dir> <port>");
  process.exit(1);
}
const root = path.resolve(dirArg);
const port = Number(portArg);

const SECURITY_HEADERS = {
  "Content-Security-Policy": headers.contentSecurityPolicy,
  "Strict-Transport-Security": `max-age=${headers.hstsMaxAgeSeconds}; includeSubDomains`,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": headers.referrerPolicy,
  "Permissions-Policy": headers.permissionsPolicy,
};

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** Resolves a URL path to a file inside `root`, or null (also blocks ../ escapes). */
function resolveFile(urlPath: string): string | null {
  const file = path.resolve(root, `.${urlPath}`);
  if (file !== root && !file.startsWith(root + path.sep)) return null;
  return existsSync(file) && statSync(file).isFile() ? file : null;
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  let urlPath = decodeURIComponent(url.pathname);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(name, value);
  }

  // Same rules as infra/lib/functions/url-rewrite.js
  if (urlPath.endsWith("/")) {
    urlPath += "index.html";
  } else if (!path.posix.basename(urlPath).includes(".")) {
    res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
    res.end();
    return;
  }

  const file = resolveFile(urlPath);
  const status = file ? 200 : 404;
  const body = file ?? resolveFile("/404.html");
  if (!body) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
  res.writeHead(status, {
    "Content-Type":
      CONTENT_TYPES[path.extname(body)] ?? "application/octet-stream",
  });
  createReadStream(body).pipe(res);
}).listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port}`);
});
