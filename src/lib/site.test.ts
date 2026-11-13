import { describe, expect, it } from "vitest";
import { pageTitle, siteConfig } from "@/lib/site";

describe("pageTitle", () => {
  it("returns just the site name when no title is given", () => {
    expect(pageTitle()).toBe(siteConfig.name);
  });

  it("appends the site name to a page title", () => {
    expect(pageTitle("Projects")).toBe("Projects · Casa Calderon");
  });

  it("ignores blank titles", () => {
    expect(pageTitle("   ")).toBe(siteConfig.name);
  });
});
