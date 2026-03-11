import ReactMarkdown from "react-markdown";

/**
 * Reusable markdown renderer with consistent styling.
 * Used for AI summaries, chat responses, and any markdown content.
 */
export const MarkdownRenderer = ({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) => {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-code:font-mono prose-code:text-xs ${className}`}>
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="font-display text-xl font-bold mt-6 mb-3 text-foreground">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-display text-lg font-bold mt-5 mb-2 text-foreground">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-display text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed text-foreground mb-3">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-foreground">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-foreground">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm text-foreground leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-muted-foreground">{children}</em>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/30 pl-4 my-3 text-sm text-muted-foreground italic">
            {children}
          </blockquote>
        ),
        code: ({ children, className: codeClassName }) => {
          const isInline = !codeClassName;
          return isInline ? (
            <code className="px-1.5 py-0.5 rounded bg-secondary text-xs font-mono text-primary">
              {children}
            </code>
          ) : (
            <code className="block p-3 rounded-lg bg-secondary text-xs font-mono text-foreground overflow-x-auto mb-3">
              {children}
            </code>
          );
        },
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
};

/**
 * Strip markdown formatting from text for plain-text previews.
 * Removes headers, bold, italic, links, code blocks, etc.
 */
export const stripMarkdown = (text: string): string => {
  return text
    .replace(/^#{1,6}\s+/gm, "")       // headers
    .replace(/\*\*(.+?)\*\*/g, "$1")    // bold
    .replace(/\*(.+?)\*/g, "$1")        // italic
    .replace(/__(.+?)__/g, "$1")        // bold alt
    .replace(/_(.+?)_/g, "$1")          // italic alt
    .replace(/`{1,3}(.+?)`{1,3}/g, "$1") // code
    .replace(/^\s*[-*+]\s+/gm, "")      // list markers
    .replace(/^\s*\d+\.\s+/gm, "")      // ordered list markers
    .replace(/^\s*>\s+/gm, "")          // blockquotes
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images
    .replace(/\n{3,}/g, "\n\n")         // excessive newlines
    .trim();
};
