import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// The CloudFront Function file has no exports (CloudFront's runtime expects a
// bare `handler` function), so load it and pull `handler` out.
const code = readFileSync(
  path.join(__dirname, "..", "lib", "functions", "url-rewrite.js"),
  "utf8",
);
type QueryString = Record<
  string,
  { value: string; multiValue?: { value: string }[] }
>;
type Request = { uri: string; querystring?: QueryString };
type Redirect = {
  statusCode: number;
  headers: { location: { value: string } };
};
const handler = new Function(`${code}; return handler;`)() as (event: {
  request: Request;
}) => Request | Redirect;

const run = (uri: string, querystring?: QueryString) =>
  handler({ request: querystring ? { uri, querystring } : { uri } });

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

  it("keeps the query string when redirecting (shared filter links)", () => {
    const res = run("/projects", {
      member: { value: "marcy" },
      type: { value: "personal" },
    }) as Redirect;
    expect(res.statusCode).toBe(301);
    expect(res.headers.location.value).toBe(
      "/projects/?member=marcy&type=personal",
    );
  });

  it("keeps repeated query parameters and bare flags", () => {
    const res = run("/projects", {
      tag: { value: "a", multiValue: [{ value: "a" }, { value: "b" }] },
      preview: { value: "" },
    }) as Redirect;
    expect(res.headers.location.value).toBe("/projects/?tag=a&tag=b&preview");
  });

  it("doesn't add a '?' when there's no query string", () => {
    const res = run("/projects", {}) as Redirect;
    expect(res.headers.location.value).toBe("/projects/");
  });

  it("leaves files with an extension untouched", () => {
    expect(run("/_next/static/chunks/app.js")).toEqual({
      uri: "/_next/static/chunks/app.js",
    });
    expect(run("/favicon.ico")).toEqual({ uri: "/favicon.ico" });
  });
});
