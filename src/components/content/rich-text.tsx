import type { ReactNode } from "react";

export type RichTextBlock =
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseRichText(input: string): RichTextBlock[] {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const blocks: RichTextBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join("\n").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "subheading", text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraph.push(rawLine.trim());
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\))/g;
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    const link = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const external = href.startsWith("http");
      return (
        <a
          href={href}
          key={`${href}-${index}`}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          {label}
        </a>
      );
    }

    return part.split("\n").map((line, lineIndex) => (
      <span key={`${line}-${lineIndex}`}>
        {lineIndex > 0 ? <br /> : null}
        {line}
      </span>
    ));
  });
}

export function RichText({ content, className }: { content: string; className?: string }) {
  const blocks = parseRichText(content);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "subheading") {
          return <h3 key={`${block.text}-${index}`}>{renderInline(block.text)}</h3>;
        }
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={`${block.text}-${index}`}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
