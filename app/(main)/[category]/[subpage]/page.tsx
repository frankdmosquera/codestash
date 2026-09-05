import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCategoryBySlug, SNIPPET_CATEGORY_KEYS } from "@/lib/constants/categories";
import { getManualBySlug } from "@/lib/actions/manual-actions";
import { getOrgPlanLimits } from "@/lib/actions/get-org-plan-limits";
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
    id: dbManual.id,
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
  // Source of truth for access control — proxy.ts only does a fast,
  // cookie-presence redirect; this is the real, server-verified check.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { category: categorySlug, subpage } = await params;
  const category = getCategoryBySlug(categorySlug);

  const dbManual = await getManualBySlug(categorySlug, subpage);
  if (!dbManual) notFound();

  // dbManual only resolves at all once activeOrganizationId is set (see
  // getManualBySlug -> getDbCategoryBySlug), so this is always a real org
  // by the time we get here — the "?? ''" is just a type-safe fallback,
  // not a real code path.
  const planLimits = await getOrgPlanLimits(session.session.activeOrganizationId ?? "");

  if (category && SNIPPET_CATEGORY_KEYS.has(category.key)) {
    const dbSnippet = toSnippet(dbManual);
    if (dbSnippet) return <SnippetPage snippet={dbSnippet} categorySlug={categorySlug} planLimits={planLimits} />;
  }

  return <ManualPage manual={dbManual} categorySlug={categorySlug} planLimits={planLimits} />;
}
