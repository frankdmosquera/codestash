"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { authClient, useSession } from "@/lib/auth-client";
import { getCategoriesForActiveOrg } from "@/lib/actions/category-actions";
import { useAutoActiveOrganization } from "@/lib/hooks/use-auto-active-organization";
import { useCloseSidebarOnOutsideClick } from "@/lib/hooks/use-close-sidebar-on-outside-click";
import { CategoryOpenProvider } from "./category-open-context";
import { CreateCategoryDialog } from "./create-category-dialog";
import { SortableCategoryList } from "./sortable-category-list";
import { WorkspaceNavItem } from "./workspace-nav-item";

// Every route this sidebar renders on requires a session (see proxy.ts) —
// there's no signed-out state to handle here anymore.
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
          <SidebarGroupLabel className="flex items-center justify-between text-neutral-500">
            Browse
            {organization && <CreateCategoryDialog organizationId={organization.id} />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <CategoryOpenProvider>
              <SortableCategoryList categories={ownCategories ?? []} />
            </CategoryOpenProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
