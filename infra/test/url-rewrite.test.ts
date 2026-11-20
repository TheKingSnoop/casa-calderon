import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// The CloudFront Function file has no exports (CloudFront's runtime expects a
// bare `handler` function), so load it and pull `handler` out.
const code = readFileSync(
  path.join(__dirname, "..", "lib", "functions", "url-rewrite.js"),
  "utf8",
);
type Request = { uri: string };
type Redirect = {
  statusCode: number;
  headers: { location: { value: string } };
};
const handler = new Function(`${code}; return handler;`)() as (event: {
  request: Request;
}) => Request | Redirect;

const run = (uri: string) => handler({ request: { uri } });

describe("url-rewrite CloudFront Function", () => {
  it("serves index.html for the root", () => {
    expect(run("/")).toEqual({ uri: "/index.html" });
  });

  it("serves index.html for paths ending in a slash", () => {
    expect(run("/members/israel/")).toEqual({
      uri: "/members/israel/index.html",
    });
  });

  it("redirects paths without a trailing slash (301)", () => {
    const res = run("/members/israel") as Redirect;
    expect(res.statusCode).toBe(301);
    expect(res.headers.location.value).toBe("/members/israel/");
  });

  it("leaves files with an extension untouched", () => {
    expect(run("/_next/static/chunks/app.js")).toEqual({
      uri: "/_next/static/chunks/app.js",
    });
    expect(run("/favicon.ico")).toEqual({ uri: "/favicon.ico" });
  });
});
