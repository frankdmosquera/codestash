// page.tsx
// → app/page.tsx

import type { Metadata } from "next";
import { CATEGORY_LIST } from "@/lib/constants/categories";
// import { CategoryCard } from "@/components/category-card";
import { GitGraphBackground } from "@/components/git-graph-background";
import { CategoryCard } from "@/components/category-card";

export const metadata: Metadata = {
  title: {
    absolute: "Codestash",
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <GitGraphBackground />
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Codestash
      </h1>
      <p className="mt-2 max-w-xl text-neutral-300">
        Your personal dev reference catalog. Pick a category to get started.
      </p>

      <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_LIST.map((category) => (
          <CategoryCard key={category.key} categoryKey={category.key} />
        ))}
      </div>
    </div>
  );
}
