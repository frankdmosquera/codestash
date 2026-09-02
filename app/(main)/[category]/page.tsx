import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategoryBySlug } from "@/lib/constants/categories";
import { getResolvedItemsForCategory } from "@/lib/actions/manual-actions";

export async function generateMetadata({
  params,
}: PageProps<"/[category]">): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  return { title: category ? category.label : "Codestash" };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[category]">) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const items = await getResolvedItemsForCategory(categorySlug, category.key, category.href);
  const Icon = category.icon;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <category.Background />

      <div className="flex items-center gap-2">
        <Icon className="size-6 text-teal-400" strokeWidth={1.75} />
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {category.label}
        </h1>
      </div>
      <p className="mt-2 max-w-xl text-neutral-300">{category.description}</p>

      {items.length === 0 ? (
        <p className="mt-12 text-neutral-400">
          Nothing here yet — check back soon.
        </p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="h-full justify-between gap-3 bg-neutral-900 p-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                      {item.description}
                    </p>
                  )}
                </div>
                <Link
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "sm" }),
                    "w-fit gap-1.5",
                  )}
                >
                  View
                  <ArrowRight className="size-3.5" />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
