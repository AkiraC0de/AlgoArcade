import type { ReactNode } from "react";

type InlineToken = {
  kind: "text" | "bold" | "italic" | "code";
  value: string;
};

const INLINE_MARKDOWN = /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|`[^`\n]+`|\*[^*\n]+?\*|_[^_\n]+?_)/g;

export function parseStudyAssistantInlineMarkdown(value: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let cursor = 0;

  for (const match of value.matchAll(INLINE_MARKDOWN)) {
    const raw = match[0];
    const start = match.index ?? cursor;
    if (start > cursor) tokens.push({ kind: "text", value: value.slice(cursor, start) });

    if ((raw.startsWith("**") && raw.endsWith("**")) || (raw.startsWith("__") && raw.endsWith("__"))) {
      tokens.push({ kind: "bold", value: raw.slice(2, -2) });
    } else if (raw.startsWith("`") && raw.endsWith("`")) {
      tokens.push({ kind: "code", value: raw.slice(1, -1) });
    } else {
      tokens.push({ kind: "italic", value: raw.slice(1, -1) });
    }
    cursor = start + raw.length;
  }

  if (cursor < value.length) tokens.push({ kind: "text", value: value.slice(cursor) });
  return tokens.length ? tokens : [{ kind: "text", value }];
}

function renderInlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  return parseStudyAssistantInlineMarkdown(value).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (token.kind === "bold") return <strong key={key} className="font-extrabold">{token.value}</strong>;
    if (token.kind === "italic") return <em key={key}>{token.value}</em>;
    if (token.kind === "code") return <code key={key} className="rounded bg-card px-1.5 py-0.5 font-mono text-[0.9em] text-primary">{token.value}</code>;
    return <span key={key}>{token.value}</span>;
  });
}

export function StudyAssistantMarkdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    const fence = line.match(/^\s*```(?:\w+)?\s*$/);
    if (fence) {
      const codeLines: string[] = [];
      lineIndex += 1;
      while (lineIndex < lines.length && !/^\s*```\s*$/.test(lines[lineIndex])) {
        codeLines.push(lines[lineIndex]);
        lineIndex += 1;
      }
      if (lineIndex < lines.length) lineIndex += 1;
      blocks.push(<pre key={`code-${lineIndex}`} className="overflow-x-auto rounded-xl bg-card px-3 py-2 text-xs text-ink"><code>{codeLines.join("\n")}</code></pre>);
      continue;
    }

    if (!line.trim()) {
      blocks.push(<div key={`space-${lineIndex}`} className="h-1" aria-hidden="true" />);
      lineIndex += 1;
      continue;
    }

    const heading = line.match(/^\s*#{1,6}\s+(.+)$/);
    if (heading) {
      blocks.push(<p key={`heading-${lineIndex}`} className="font-extrabold leading-snug text-ink">{renderInlineMarkdown(heading[1], `heading-${lineIndex}`)}</p>);
      lineIndex += 1;
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    if (unordered) {
      const items: ReactNode[] = [];
      while (lineIndex < lines.length) {
        const item = lines[lineIndex].match(/^\s*[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(<li key={`unordered-${lineIndex}`}>{renderInlineMarkdown(item[1], `unordered-${lineIndex}`)}</li>);
        lineIndex += 1;
      }
      blocks.push(<ul key={`list-${lineIndex}`} className="list-disc space-y-1 pl-5">{items}</ul>);
      continue;
    }

    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ordered) {
      const items: ReactNode[] = [];
      while (lineIndex < lines.length) {
        const item = lines[lineIndex].match(/^\s*\d+[.)]\s+(.+)$/);
        if (!item) break;
        items.push(<li key={`ordered-${lineIndex}`}>{renderInlineMarkdown(item[1], `ordered-${lineIndex}`)}</li>);
        lineIndex += 1;
      }
      blocks.push(<ol key={`ordered-list-${lineIndex}`} className="list-decimal space-y-1 pl-5">{items}</ol>);
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      blocks.push(<blockquote key={`quote-${lineIndex}`} className="border-l-2 border-primary/40 pl-3 italic text-muted-fg">{renderInlineMarkdown(quote[1], `quote-${lineIndex}`)}</blockquote>);
      lineIndex += 1;
      continue;
    }

    blocks.push(<p key={`line-${lineIndex}`} className="m-0">{renderInlineMarkdown(line, `line-${lineIndex}`)}</p>);
    lineIndex += 1;
  }

  return <div className="space-y-1.5">{blocks}</div>;
}
