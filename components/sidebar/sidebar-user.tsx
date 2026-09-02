"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient, useSession } from "@/lib/auth-client";

export function SidebarUser() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="size-7 shrink-0 animate-pulse rounded-full bg-neutral-800" />;
  }

  if (!session) {
    return (
      <div className="flex shrink-0 gap-2">
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "bg-neutral-800 text-white hover:bg-neutral-700",
          )}
        >
          Sign in
        </Link>
        <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
          Sign up
        </Link>
      </div>
    );
  }

  const initial = session.user.name?.[0]?.toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex shrink-0 items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-7">
              <AvatarFallback className="bg-teal-900 text-teal-200">
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        }
      />
      {/* Workspace navigation (create/members) lives in the sidebar's
          "Workspace" section, not here — one place for it, not two. */}
      <DropdownMenuContent side="bottom" align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
            {session.user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await authClient.signOut();
              router.push("/");
              router.refresh();
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
