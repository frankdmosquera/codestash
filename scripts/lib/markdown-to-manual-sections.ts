// Turns a markdown file's body into the `manual`/`section` block tree the
// app already renders (see lib/data/types.ts's ContentBlock/ManualSection,
// and lib/helpers/build-rendered-sections.tsx + parse-inline.tsx for how
// they're displayed). Exists so the in-app doc-family manuals (roadmap,
// story, setup, roles-and-billing-plan, rules) can be synced directly from
// their real md-docs/*.md source instead of a hand-typed duplicate of it —
// three separate rounds of drift between the two in one day is what proved
// hand-duplicating content doesn't hold up.
//
// Supports what these specific docs actually use: nested `#`-`######`
// headings, paragraphs, `-`/`*` bullet lists, `1.` ordered lists (rendered
// as a plain list — there's no ordered/unordered distinction in
// ContentBlock), fenced code blocks, and pipe tables (no table block type
// exists, so a table becomes a list of "Header: cell — Header: cell" rows).
// Inline `**bold**` and `` `code` `` pass straight through — parseInline
// already renders those. Single-asterisk *italics* do not — parseInline
// doesn't support that syntax, so they render as literal asterisks; a
// known, minor gap, not silently papered over.

export type ParsedBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string };

export type ParsedSection = {
  title: string;
  blocks?: ParsedBlock[];
  children?: ParsedSection[];
};

function stripLinkSyntax(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
}

// Pulls the document's own `# Title` line out, for callers that want to use
// it as a wrapper section's title (see parseMarkdownToSections's rootTitle
// option) rather than as in-app manual content.
export function extractH1Title(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.*)$/m);
  return match?.[1]?.trim();
}

export function parseMarkdownToSections(
  markdown: string,
  options: { rootTitle?: string } = {},
): ParsedSection[] {
  const lines = markdown.split("\n");

  type StackEntry = { level: number; section: ParsedSection };
  const roots: ParsedSection[] = [];
  const stack: StackEntry[] = [];

  if (options.rootTitle) {
    const root: ParsedSection = { title: options.rootTitle };
    roots.push(root);
    stack.push({ level: 1, section: root });
  }

  let paragraphLines: string[] = [];
  let listItems: string[] | null = null;
  let tableHeaders: string[] | null = null;
  let tableRows: string[][] | null = null;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  function currentSection(): ParsedSection | null {
    return stack.length > 0 ? stack[stack.length - 1].section : null;
  }

  function pushBlock(block: ParsedBlock) {
    const section = currentSection();
    if (!section) return; // content before the first heading isn't kept
    section.blocks = section.blocks ?? [];
    section.blocks.push(block);
  }

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      pushBlock({ type: "p", text: paragraphLines.join(" ").trim() });
      paragraphLines = [];
    }
  }

  function flushList() {
    if (listItems && listItems.length > 0) {
      pushBlock({ type: "list", items: listItems });
    }
    listItems = null;
  }

  function flushTable() {
    if (tableRows && tableRows.length > 0 && tableHeaders) {
      const headers = tableHeaders;
      const items = tableRows.map((cells) =>
        cells
          .map((cell, i) => `${headers[i] ?? ""}: ${stripLinkSyntax(cell)}`)
          .join(" — "),
      );
      pushBlock({ type: "list", items });
    }
    tableHeaders = null;
    tableRows = null;
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushTable();
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");

    if (inCodeBlock) {
      if (line.trim() === "```") {
        inCodeBlock = false;
        pushBlock({ type: "code", code: codeLines.join("\n") });
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (line.trim().startsWith("```")) {
      flushAll();
      inCodeBlock = true;
      codeLines = [];
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      // The document's own H1 isn't in-app content — either dropped, or
      // (via rootTitle) already used as the wrapper section's title.
      if (level === 1) continue;

      const newSection: ParsedSection = { title };

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        roots.push(newSection);
      } else {
        const parent = stack[stack.length - 1].section;
        parent.children = parent.children ?? [];
        parent.children.push(newSection);
      }

      stack.push({ level, section: newSection });
      continue;
    }

    const trimmed = line.trim();

    if (trimmed === "") {
      flushAll();
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      flushTable();
      listItems = listItems ?? [];
      listItems.push(bulletMatch[1].trim());
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      flushTable();
      listItems = listItems ?? [];
      listItems.push(orderedMatch[1].trim());
      continue;
    }

    if (trimmed.startsWith("|")) {
      flushParagraph();
      flushList();
      const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue; // separator row
      if (!tableRows) {
        tableRows = [];
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    }

    // A plain line right after a list item, with no blank line in between,
    // is markdown's "lazy continuation" of that item's text — not a new
    // paragraph. Only actually a new paragraph once the list has been
    // flushed (by a blank line, a new bullet elsewhere, etc.).
    if (listItems && listItems.length > 0) {
      listItems[listItems.length - 1] += ` ${trimmed}`;
      continue;
    }

    flushTable();
    paragraphLines.push(trimmed);
  }

  flushAll();
  return roots;
}
