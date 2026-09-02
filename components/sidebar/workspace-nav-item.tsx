"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ChevronRight, Plus, Users } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { authClient, useSession } from "@/lib/auth-client";

const itemClass =
  "text-neutral-200 [&_svg]:size-5 [&_svg]:text-teal-400 hover:bg-neutral-800 hover:text-white";

export function WorkspaceNavItem() {
  const [open, setOpen] = useState(true);
  const { data: session, isPending: sessionPending } = useSession();
  const { data: organization, isPending: orgPending } =
    authClient.useActiveOrganization();

  // Nothing to navigate to until signed in — no workspace can exist yet.
  if (sessionPending || !session) return null;

  if (orgPending) return null;

  if (!organization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href="/onboarding" />}
            size="lg"
            className={itemClass}
          >
            <Plus />
            <span className="text-base">Create workspace</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenu>
        <SidebarMenuItem>
          <CollapsibleTrigger
            render={<SidebarMenuButton size="lg" className={itemClass} />}
          >
            <Building2 />
            <span className="truncate text-base">{organization.name}</span>
            <ChevronRight
              className={cn(
                "ml-auto size-4! text-neutral-500! transition-transform",
                open && "rotate-90",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="border-neutral-800">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  render={<Link href="/workspace/members" />}
                  className="text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  <Users className="size-4" />
                  <span>Members</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </SidebarMenu>
    </Collapsible>
  );
}
