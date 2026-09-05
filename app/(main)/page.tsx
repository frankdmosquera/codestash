// page.tsx
// → app/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { GitGraphBackground } from "@/components/git-graph-background";
import { CategoryCard } from "@/components/category-card";
import { getCategoriesForActiveOrg } from "@/lib/actions/category-actions";
import { getActiveOrganizationDetails } from "@/lib/actions/workspace-actions";

// "Codestash" is the app's own name — a sensible fallback for a signed-in
// user who genuinely has no active org yet, not a stand-in for real data.
export async function generateMetadata(): Promise<Metadata> {
  const organization = await getActiveOrganizationDetails();
  return { title: organization?.name ?? "Codestash" };
}

export default async function HomePage() {
  // Source of truth for access control — proxy.ts only does a fast,
  // cookie-presence redirect; this is the real, server-verified check.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const [categories, organization] = await Promise.all([
    getCategoriesForActiveOrg(),
    getActiveOrganizationDetails(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <GitGraphBackground />
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {organization?.name ?? "Codestash"}
      </h1>
      <p className="mt-2 max-w-xl text-neutral-300">
        Your personal dev reference catalog. Pick a category to get started.
      </p>

      <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
