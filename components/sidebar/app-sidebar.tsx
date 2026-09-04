"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { resolveIcon } from "@/lib/icon-map";
import { authClient, useSession } from "@/lib/auth-client";
import { getCategoriesForActiveOrg, getPublicCategories } from "@/lib/actions/category-actions";
import { useAutoActiveOrganization } from "@/lib/hooks/use-auto-active-organization";
import { useCloseSidebarOnOutsideClick } from "@/lib/hooks/use-close-sidebar-on-outside-click";
import { CategoryNavItem } from "./category-nav-item";
import { CategoryOpenProvider } from "./category-open-context";
import { SortableCategoryList } from "./sortable-category-list";
import { WorkspaceNavItem } from "./workspace-nav-item";

export function AppSidebar() {
  const { data: session } = useSession();
  const { data: organization } = authClient.useActiveOrganization();
  useAutoActiveOrganization();
  useCloseSidebarOnOutsideClick();

  const { data: ownCategories } = useQuery({
    queryKey: ["categories", organization?.id],
    queryFn: getCategoriesForActiveOrg,
    enabled: !!organization,
  });

  // Signed-out visitor, or a signed-in user with no active workspace — the
  // catalog is public content, so it still reads from the DB, just without
  // reorder (no drag handle passed below; reorderCategoryAction requires a
  // real active-org session regardless of what the UI would let you try).
  const { data: publicCategories } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getPublicCategories,
    enabled: !organization,
  });

  // Reorderable, DB-backed categories once the active workspace actually
  // has some seeded; otherwise the read-only public catalog.
  const useOwnCategories = !!organization && !!ownCategories && ownCategories.length > 0;

  return (
    <Sidebar className="border-neutral-800 bg-neutral-950 text-neutral-200 **:data-[slot=sidebar-container]:bg-neutral-950 **:data-[slot=sidebar-gap]:bg-neutral-950">
      <SidebarContent className="bg-neutral-950">
        {session && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-neutral-500">
              Workspace
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <WorkspaceNavItem />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-neutral-500">
            Browse
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <CategoryOpenProvider>
              {useOwnCategories ? (
                <SortableCategoryList categories={ownCategories} />
              ) : (
                <SidebarMenu>
                  {(publicCategories ?? []).map((row) => (
                    <CategoryNavItem
                      key={row.id}
                      icon={resolveIcon(row.icon)}
                      label={row.label}
                      href={`/${row.slug}`}
                      dbCategoryId={row.id}
                    />
                  ))}
                </SidebarMenu>
              )}
            </CategoryOpenProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
