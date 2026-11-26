import { describe, expect, it } from "vitest";
import {
  decodeEmail,
  displayUrl,
  encodeEmail,
  formatMonth,
  formatPeriod,
  initials,
} from "./format";
import { PLACEHOLDER_SLUG, withPlaceholder } from "./static-params";
import { SLUG_PATTERN } from "./content/schema";

describe("formatMonth / formatPeriod", () => {
  it("formats year-month and full dates as 'Mon YYYY'", () => {
    expect(formatMonth("2026-11")).toBe("Nov 2026");
    expect(formatMonth("2025-01-31")).toBe("Jan 2025");
  });

  it("shows 'Present' when there's no end date", () => {
    expect(formatPeriod("2024-09")).toBe("Sep 2024 – Present");
    expect(formatPeriod("2024-09", "2025-06")).toBe("Sep 2024 – Jun 2025");
  });

  it("shows a single date when there's only an end date (e.g. graduation)", () => {
    expect(formatPeriod(undefined, "2015-07")).toBe("Jul 2015");
  });
});

describe("initials", () => {
  it("uses the first letters of up to two names", () => {
    expect(initials("Israel Calderon")).toBe("IC");
    expect(initials("Marcy")).toBe("M");
    expect(initials("  ana  maria  lopez ")).toBe("AM");
  });
});

describe("email obfuscation", () => {
  it("round-trips, and the encoded form doesn't contain the address", () => {
    const email = "hello@example.com";
    const encoded = encodeEmail(email);
    expect(encoded).not.toContain("example");
    expect(encoded).not.toContain("@");
    expect(decodeEmail(encoded)).toBe(email);
  });
});

describe("displayUrl", () => {
  it("strips protocol, www and trailing slash", () => {
    expect(displayUrl("https://www.github.com/ana/")).toBe("github.com/ana");
  });
});

describe("withPlaceholder", () => {
  it("passes real params through", () => {
    expect(withPlaceholder([{ slug: "ana" }])).toEqual([{ slug: "ana" }]);
  });

  it("returns one placeholder param when there's nothing to generate", () => {
    expect(withPlaceholder([])).toEqual([{ slug: PLACEHOLDER_SLUG }]);
  });

  it("uses a slug that real content can never have", () => {
    expect(SLUG_PATTERN.test(PLACEHOLDER_SLUG)).toBe(false);
  });
});
