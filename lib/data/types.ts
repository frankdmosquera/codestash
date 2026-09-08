export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string }
  | { type: "note"; text: string };

export type ManualSection = {
  id: string;
  number: string;
  title: string;
  blocks?: ContentBlock[];
  children?: ManualSection[];
};

export type Manual = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  createdAt?: string;
  sections: ManualSection[];
};

// The compact view for any manual whose own shape is exactly one section,
// no nesting, holding a single "code" block — see toSnippet in
// app/(main)/[category]/[subpage]/page.tsx. Not tied to any particular
// category; any manual that happens to match this shape renders this way.
export type Snippet = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  code: string;
  createdAt?: string;
};
