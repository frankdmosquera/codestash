import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getManualBySlug } from "@/lib/actions/manual-actions";
import { getOrgPlanLimits } from "@/lib/actions/get-org-plan-limits";
import { ManualPage } from "@/components/manuals/manual-page";
import { SnippetPage } from "@/components/snippet-page";
import type { Manual, Snippet } from "@/lib/data/types";

// A snippet is just a manual whose *own shape* happens to be exactly one
// section, with no children, holding a single "code" block — not a
// category-level distinction anymore (there's no more curated/snippet-only
// tier of category, see lib/actions/category-actions.ts). Any manual in any
// category renders this compact "title + code" view the moment it matches
// this shape; add a second section, or nest anything under the first, and
// it renders as a normal accordion instead.
function toSnippet(dbManual: Manual): Snippet | undefined {
  const [only, ...rest] = dbManual.sections;
  if (!only || rest.length > 0 || only.children?.length) return undefined;
  const blocks = only.blocks ?? [];
  const [block, ...moreBlocks] = blocks;
  if (!block || moreBlocks.length > 0 || block.type !== "code") return undefined;
  return {
    id: dbManual.id,
    slug: dbManual.slug,
    title: dbManual.title,
    description: dbManual.subtitle || undefined,
    code: block.code,
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
  // Source of truth for access control — proxy.ts only does a fast,
  // cookie-presence redirect; this is the real, server-verified check.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { category: categorySlug, subpage } = await params;

  const dbManual = await getManualBySlug(categorySlug, subpage);
  if (!dbManual) notFound();

  // dbManual only resolves at all once activeOrganizationId is set (see
  // getManualBySlug -> getDbCategoryBySlug), so this is always a real org
  // by the time we get here — the "?? ''" is just a type-safe fallback,
  // not a real code path.
  const planLimits = await getOrgPlanLimits(session.session.activeOrganizationId ?? "");

  const dbSnippet = toSnippet(dbManual);
  if (dbSnippet) return <SnippetPage snippet={dbSnippet} categorySlug={categorySlug} planLimits={planLimits} />;

  return <ManualPage manual={dbManual} categorySlug={categorySlug} planLimits={planLimits} />;
}
