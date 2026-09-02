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

  const staticTitle =
    category.key === "manuals"
      ? getManual(subpage)?.title
      : getSnippet(category.key, subpage)?.title;
  if (staticTitle) return { title: staticTitle };

  const dbManual = await getManualBySlug(categorySlug, subpage);
  return { title: dbManual?.title ?? category.label };
}

export default async function SubpagePage({
  params,
}: PageProps<"/[category]/[subpage]">) {
  const { category: categorySlug, subpage } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  // Static catalog first (the fixed 5 built-in categories' seed content),
  // then the DB-backed catalog for this org — lets a workspace's own
  // manuals live at the same category slug without colliding.
  if (category.key === "manuals") {
    const staticManual = getManual(subpage);
    if (staticManual) return <ManualPage manual={staticManual} />;
  } else {
    const staticSnippet = getSnippet(category.key, subpage);
    if (staticSnippet) return <SnippetPage snippet={staticSnippet} />;
  }

  const dbManual = await getManualBySlug(categorySlug, subpage);
  if (!dbManual) notFound();
  return <ManualPage manual={dbManual} />;
}
