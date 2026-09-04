export type CatalogCategoryKey =
  | "manuals"
  | "hooks"
  | "helpers"
  | "blocks"
  | "aiInstructions";

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
  slug: string;
  title: string;
  subtitle: string;
  createdAt?: string;
  sections: ManualSection[];
};

// Shared shape for hooks, helpers, blocks, and AI instructions — each is
// just "one piece of copy-pasteable code with a title." Manuals are the one
// category structurally different enough to need their own shape above.
export type Snippet = {
  slug: string;
  title: string;
  description?: string;
  code: string;
  createdAt?: string;
};
