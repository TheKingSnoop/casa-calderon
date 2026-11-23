import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a Markdown body from content/ (bios, project write-ups).
 * Safe by default: react-markdown does not render raw HTML, so a stray
 * <script> or <iframe> in a content file is shown as text, never executed.
 */

// The page already has an <h1> (the member's name / project title), so a
// "# Heading" in content is demoted to <h2> to keep the outline valid.
const components: Components = {
  h1: ({ children, id }) => <h2 id={id}>{children}</h2>,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
