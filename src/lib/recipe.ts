/**
 * Splits a recipe's Markdown body at its "## " headings, so the page can lay
 * out Ingredients and Method side by side like a recipe card.
 *
 *   "Intro\n## Ingredients\n- a\n## Method\n1. b"
 *   → { intro: "Intro", sections: [{ title: "Ingredients", body: "- a" }, ...] }
 */
export function splitSections(markdown: string): {
  intro: string;
  sections: { title: string; body: string }[];
} {
  const [intro, ...rest] = markdown.split(/^##[ \t]+(.+?)[ \t]*$/m);
  const sections = [];
  for (let i = 0; i < rest.length; i += 2) {
    sections.push({ title: rest[i], body: rest[i + 1].trim() });
  }
  return { intro: intro.trim(), sections };
}
