import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/lib/constants/categories";
import { getManualBySlug } from "@/lib/actions/manual-actions";
import { ManualPage } from "@/components/manuals/manual-page";
import { SnippetPage } from "@/components/snippet-page";
import type { CatalogCategoryKey, Manual, Snippet } from "@/lib/data/types";

// The 4 non-manual categories store their content as a single-section
// manual with one "code" block (see toSnippet below) — everything else
// (the "manuals" category, and any custom DB-only category) renders as a
// full multi-section manual instead.
const SNIPPET_CATEGORY_KEYS = new Set<CatalogCategoryKey>([
  "hooks",
  "helpers",
  "blocks",
  "aiInstructions",
]);

// A DB snippet is stored as a manual with exactly one section and a single
// "code" block (see scripts/merge-snippet-into-manual.ts) — same table as
// manuals, just the degenerate one-node case. This reshapes it back into
// the flat `Snippet` shape SnippetPage expects, so non-manual categories
// keep rendering as "title + code", not an accordion with one item.
function toSnippet(dbManual: Manual): Snippet | undefined {
  const blocks = dbManual.sections[0]?.blocks;
  const code = blocks?.find((b) => b.type === "code")?.code;
  if (code === undefined) return undefined;
  return {
    slug: dbManual.slug,
    title: dbManual.title,
    description: dbManual.subtitle || undefined,
    code,
    createdAt: dbManual.createdAt,
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/[category]/[subpage]">): Promise<Metadata> {
  const { category: categorySlug, subpage } = await params;
  const dbManual = await getManualBySlug(categorySlug, subpage);
  return { title: dbManual?.title ?? "Codestash" };
}

export default async function SubpagePage({
  params,
}: PageProps<"/[category]/[subpage]">) {
  const { category: categorySlug, subpage } = await params;
  const category = getCategoryBySlug(categorySlug);

  const dbManual = await getManualBySlug(categorySlug, subpage);
  if (!dbManual) notFound();

  if (category && SNIPPET_CATEGORY_KEYS.has(category.key)) {
    const dbSnippet = toSnippet(dbManual);
    if (dbSnippet) return <SnippetPage snippet={dbSnippet} />;
  }

  return <ManualPage manual={dbManual} />;
}
