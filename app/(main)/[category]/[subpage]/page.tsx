import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/lib/constants/categories";
import { getManual, getSnippet } from "@/lib/data";
import { ManualPage } from "@/components/manuals/manual-page";
import { SnippetPage } from "@/components/snippet-page";

export async function generateMetadata({
  params,
}: PageProps<"/[category]/[subpage]">): Promise<Metadata> {
  const { category: categorySlug, subpage } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: "Codestash" };

  const title =
    category.key === "manuals"
      ? getManual(subpage)?.title
      : getSnippet(category.key, subpage)?.title;

  return { title: title ?? category.label };
}

export default async function SubpagePage({
  params,
}: PageProps<"/[category]/[subpage]">) {
  const { category: categorySlug, subpage } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  if (category.key === "manuals") {
    const manual = getManual(subpage);
    if (!manual) notFound();
    return <ManualPage manual={manual} />;
  }

  const snippet = getSnippet(category.key, subpage);
  if (!snippet) notFound();
  return <SnippetPage snippet={snippet} />;
}
