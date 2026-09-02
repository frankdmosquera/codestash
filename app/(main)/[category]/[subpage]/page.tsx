import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/lib/constants/categories";
import { getManual, getSnippet } from "@/lib/data";
import { getManualBySlug } from "@/lib/actions/manual-actions";
import { ManualPage } from "@/components/manuals/manual-page";
import { SnippetPage } from "@/components/snippet-page";

export async function generateMetadata({
  params,
}: PageProps<"/[category]/[subpage]">): Promise<Metadata> {
  const { category: categorySlug, subpage } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: "Codestash" };

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
  if (!category) notFound();

  // DB-backed content first — same "DB overrides static" priority as the
  // sidebar and category page, so a workspace's own manual at this slug
  // (e.g. a trimmed rewrite of a built-in one) isn't shadowed by the
  // static catalog entry sharing that slug. Static is the fallback for
  // slugs the DB doesn't have anything for.
  const dbManual = await getManualBySlug(categorySlug, subpage);
  if (dbManual) return <ManualPage manual={dbManual} />;

  if (category.key === "manuals") {
    const staticManual = getManual(subpage);
    if (staticManual) return <ManualPage manual={staticManual} />;
  } else {
    const staticSnippet = getSnippet(category.key, subpage);
    if (staticSnippet) return <SnippetPage snippet={staticSnippet} />;
  }

  notFound();
}
