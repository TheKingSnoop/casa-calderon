import { describe, expect, it } from "vitest";
import {
  filterProjects,
  filtersToQuery,
  parseFilters,
  type ProjectFilters,
} from "./project-filters";

const projects = [
  { slug: "site", members: ["israel"], type: "personal" as const },
  { slug: "joint", members: ["cristhyan", "marcy"], type: "personal" as const },
  { slug: "nda", members: ["cristhyan"], type: "professional" as const },
];
const members = ["israel", "cristhyan", "marcy", "benjamin"];
const url = (query: string) => new URLSearchParams(query);
const slugs = (filters: ProjectFilters) =>
  filterProjects(projects, filters).map((p) => p.slug);

describe("parseFilters", () => {
  it("reads member and type from the URL", () => {
    expect(parseFilters(url("member=marcy&type=personal"), members)).toEqual({
      member: "marcy",
      type: "personal",
    });
  });

  it("ignores unknown members and types instead of showing nothing", () => {
    expect(parseFilters(url("member=nobody&type=secret"), members)).toEqual({
      member: undefined,
      type: undefined,
    });
  });

  it("returns no filters for an empty query", () => {
    expect(parseFilters(url(""), members)).toEqual({});
  });
});

describe("filterProjects", () => {
  it("returns everything with no filters", () => {
    expect(slugs({})).toEqual(["site", "joint", "nda"]);
  });

  it("filters by member, including joint projects", () => {
    expect(slugs({ member: "cristhyan" })).toEqual(["joint", "nda"]);
    expect(slugs({ member: "marcy" })).toEqual(["joint"]);
  });

  it("filters by type", () => {
    expect(slugs({ type: "professional" })).toEqual(["nda"]);
  });

  it("combines member and type", () => {
    expect(slugs({ member: "cristhyan", type: "personal" })).toEqual(["joint"]);
    expect(slugs({ member: "israel", type: "professional" })).toEqual([]);
  });
});

describe("filtersToQuery", () => {
  it("builds a shareable query string", () => {
    expect(filtersToQuery({ member: "marcy", type: "personal" })).toBe(
      "?member=marcy&type=personal",
    );
    expect(filtersToQuery({ type: "professional" })).toBe("?type=professional");
  });

  it("is empty when no filters are active, so the URL stays clean", () => {
    expect(filtersToQuery({})).toBe("");
  });

  it("round-trips through parseFilters", () => {
    const filters = { member: "cristhyan", type: "professional" as const };
    expect(
      parseFilters(url(filtersToQuery(filters).slice(1)), members),
    ).toEqual(filters);
  });
});
