// category-card.tsx
// → components/category-card.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { getTopItems } from "@/lib/helpers/get-top-items";
import { resolveIcon } from "@/lib/icon-map";
import { authClient } from "@/lib/auth-client";
import { getResolvedItemsForCategory } from "@/lib/actions/manual-actions";
import { deleteCategoryAction, type DbCategoryRow } from "@/lib/actions/category-actions";
import { getCategoryBySlug } from "@/lib/constants/categories";

// Takes the already-resolved icon component as a prop rather than resolving
// it inline where it's rendered — same pattern as CategoryIcon in
// [category]/page.tsx (resolveIcon()'s result used as a JSX tag in the same
// scope it's assigned in trips the "components created during render" rule).
function CategoryCardIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="size-5 text-teal-400" strokeWidth={1.75} />;
}

type CategoryCardProps = {
  category: DbCategoryRow;
};

// Client component (not the async Server Component this used to be) so it
// can live inside the home page's drag-and-drop grid — dnd-kit's
// useSortable needs a client boundary around each draggable card either
// way, so fetching its own item preview client-side (same pattern
// CategoryNavItem already uses in the sidebar) costs nothing extra.
export function CategoryCard({ category }: CategoryCardProps) {
  const href = `/${category.slug}`;
  const { data: allItems } = useQuery({
    queryKey: ["resolved-items", category.slug],
    queryFn: () => getResolvedItemsForCategory(category.slug, href),
  });
  const items = getTopItems(allItems ?? [], 4);

  // Only ever offered for a custom, DB-only category (deleteCategoryAction
  // itself refuses a curated one) - same reasoning as the category page's
  // own DeleteCategoryDialog, checked client-side here just to avoid
  // showing a control that would only ever error.
  const isCustomCategory = !getCategoryBySlug(category.slug);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: organization } = authClient.useActiveOrganization();
  const queryClient = useQueryClient();

  const { mutate: deleteCategory, isPending, error } = useMutation({
    mutationFn: () => deleteCategoryAction(category.id),
    onSuccess: () => {
      setConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories", organization?.id] });
    },
  });

  return (
    <Card className="group relative flex h-full flex-col justify-between bg-neutral-900 p-6">
      {isCustomCategory && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${category.label}`}
                className="absolute top-3 left-3 z-10 text-red-600 opacity-0 hover:bg-red-500/10 hover:text-red-700 group-hover:opacity-100 dark:text-red-400 dark:hover:text-red-300"
              />
            }
          >
            <Trash2 className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{category.label}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                {items.length > 0
                  ? `This permanently deletes the category and everything inside it. This cannot be undone.`
                  : "This permanently deletes the category. This cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && <p className="text-sm text-destructive">{error.message}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isPending}
                onClick={() => deleteCategory()}
              >
                {isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div>
        <div className="flex items-center gap-2">
          <CategoryCardIcon icon={resolveIcon(category.icon)} />
          <h3 className="text-2xl font-semibold text-white">{category.label}</h3>
        </div>

        <ul className="mt-3 space-y-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block truncate rounded-md px-2 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "w-fit gap-1.5",
        )}
      >
        See all
        <ArrowRight className="size-3.5" />
      </Link>
    </Card>
  );
}
