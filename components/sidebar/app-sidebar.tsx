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
import { CATEGORY_LIST } from "@/lib/constants/categories";
import { authClient, useSession } from "@/lib/auth-client";
import { getCategoriesForActiveOrg } from "@/lib/actions/category-actions";
import { useAutoActiveOrganization } from "@/lib/hooks/use-auto-active-organization";
import { CategoryNavItem } from "./category-nav-item";
import { SortableCategoryList } from "./sortable-category-list";
import { WorkspaceNavItem } from "./workspace-nav-item";

export function AppSidebar() {
  const { data: session } = useSession();
  const { data: organization } = authClient.useActiveOrganization();
  useAutoActiveOrganization();

  const { data: dbCategories } = useQuery({
    queryKey: ["categories", organization?.id],
    queryFn: getCategoriesForActiveOrg,
    enabled: !!organization,
  });

  // Reorderable, DB-backed categories once the active workspace actually
  // has some seeded; otherwise the fixed static list — e.g. signed out,
  // no active workspace, or a brand-new workspace nothing's been seeded
  // into yet (there's no "create category" UI yet to have made any).
  const useDbCategories = !!organization && !!dbCategories && dbCategories.length > 0;

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
            {useDbCategories ? (
              <SortableCategoryList categories={dbCategories} />
            ) : (
              <SidebarMenu>
                {CATEGORY_LIST.map((category) => (
                  <CategoryNavItem
                    key={category.key}
                    icon={category.icon}
                    label={category.label}
                    href={category.href}
                    staticKey={category.key}
                  />
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
