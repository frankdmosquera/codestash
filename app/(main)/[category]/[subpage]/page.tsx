import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/lib/constants/categories";
import { getManual, getSnippet } from "@/lib/data";
import { getManualBySlug, getDbCategoryBySlug } from "@/lib/actions/manual-actions";
import { ManualPage } from "@/components/manuals/manual-page";
import { SnippetPage } from "@/components/snippet-page";
import type { Manual, Snippet } from "@/lib/data/types";

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
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    // No static counterpart — a genuinely custom, DB-only category.
    const dbManual = await getManualBySlug(categorySlug, subpage);
    return { title: dbManual?.title ?? "Codestash" };
  }

  const dbManual = await getManualBySlug(categorySlug, subpage);
  if (dbManual) return { title: dbManual.title };

  const staticTitle =
    category.key === "manuals"
      ? getManual(subpage)?.title
      : getSnippet(category.key, subpage)?.title;
  return { title: staticTitle ?? category.label };
}

export default async function SubpagePage({
  params,
}: PageProps<"/[category]/[subpage]">) {
  const { category: categorySlug, subpage } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    // No static counterpart — a genuinely custom, DB-only category (e.g.
    // one seeded outside the 5 built-in ones). Everything in a category
    // like this is a manual, never a snippet — the snippet-shaped
    // degenerate case only applies to the 4 known static non-manuals
    // keys (hooks/helpers/blocks/aiInstructions), which this isn't one of.
    const dbCategoryRow = await getDbCategoryBySlug(categorySlug);
    if (!dbCategoryRow) notFound();
    const dbManual = await getManualBySlug(categorySlug, subpage);
    if (dbManual) return <ManualPage manual={dbManual} />;
    notFound();
  }

  // DB-backed content first — same "DB overrides static" priority as the
  // sidebar and category page, so a workspace's own manual at this slug
  // (e.g. a trimmed rewrite of a built-in one) isn't shadowed by the
  // static catalog entry sharing that slug. Static is the fallback for
  // slugs the DB doesn't have anything for.
  const dbManual = await getManualBySlug(categorySlug, subpage);
  if (dbManual) {
    if (category.key === "manuals") return <ManualPage manual={dbManual} />;
    const dbSnippet = toSnippet(dbManual);
    if (dbSnippet) return <SnippetPage snippet={dbSnippet} />;
  }

  if (category.key === "manuals") {
    const staticManual = getManual(subpage);
    if (staticManual) return <ManualPage manual={staticManual} />;
  } else {
    const staticSnippet = getSnippet(category.key, subpage);
    if (staticSnippet) return <SnippetPage snippet={staticSnippet} />;
  }

  notFound();
}
