import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCategoryBySlug, isSnippetShapedSlug } from "@/lib/constants/categories";
import { getResolvedItemsForCategory, getDbCategoryBySlug } from "@/lib/actions/manual-actions";
import { getOrgPlanLimits } from "@/lib/actions/get-org-plan-limits";
import { resolveIcon } from "@/lib/icon-map";
import { SortableItemGrid } from "@/components/sortable-item-grid";
import { CreateManualDialog } from "@/components/manuals/create-manual-dialog";
import type { LucideIcon } from "lucide-react";

// Takes the already-resolved icon component as a prop (same pattern as
// CategoryNavItem) rather than resolving it inline where it's rendered —
// resolveIcon()'s result assigned to a local const and used as a JSX tag
// in the same scope trips the "components created during render" rule.
function CategoryIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="size-6 text-teal-400" strokeWidth={1.75} />;
}

export async function generateMetadata({
  params,
}: PageProps<"/[category]">): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (category) return { title: category.label };

  const dbCategoryRow = await getDbCategoryBySlug(categorySlug);
  return { title: dbCategoryRow ? dbCategoryRow.label : "Codestash" };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[category]">) {
  // Source of truth for access control — proxy.ts only does a fast,
  // cookie-presence redirect; this is the real, server-verified check.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  const planLimits = await getOrgPlanLimits(session.session.activeOrganizationId ?? "");

  if (!category) {
    // No static counterpart — a genuinely custom, DB-only category. No
    // decorative Background or curated icon set for these yet, just the
    // DB row's own label/description/icon.
    const dbCategoryRow = await getDbCategoryBySlug(categorySlug);
    if (!dbCategoryRow) notFound();

    const items = await getResolvedItemsForCategory(categorySlug, `/${categorySlug}`);

    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryIcon icon={resolveIcon(dbCategoryRow.icon)} />
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {dbCategoryRow.label}
            </h1>
          </div>
          <CreateManualDialog
            categoryId={dbCategoryRow.id}
            categoryHref={`/${categorySlug}`}
            isSnippetShaped={isSnippetShapedSlug(categorySlug)}
            planLimits={planLimits}
          />
        </div>
        {dbCategoryRow.description && (
          <p className="mt-2 max-w-xl text-neutral-300">{dbCategoryRow.description}</p>
        )}
        <SortableItemGrid items={items} />
      </div>
    );
  }

  const [items, dbCategoryRow] = await Promise.all([
    getResolvedItemsForCategory(categorySlug, category.href),
    getDbCategoryBySlug(categorySlug),
  ]);
  const Icon = category.icon;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <category.Background />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="size-6 text-teal-400" strokeWidth={1.75} />
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {category.label}
          </h1>
        </div>
        {dbCategoryRow && (
          <CreateManualDialog
            categoryId={dbCategoryRow.id}
            categoryHref={category.href}
            isSnippetShaped={isSnippetShapedSlug(categorySlug)}
            planLimits={planLimits}
          />
        )}
      </div>
      <p className="mt-2 max-w-xl text-neutral-300">{category.description}</p>

      <SortableItemGrid items={items} />
    </div>
  );
}
