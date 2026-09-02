import Link from "next/link";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarSearch } from "./sidebar-search";
import { SidebarUser } from "./sidebar-user";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-neutral-800 bg-neutral-950 px-3 text-white">
      <SidebarTrigger className="text-white hover:bg-neutral-800 hover:text-white" />

      <Link
        href="/"
        className="flex shrink-0 items-center gap-1.5 font-mono text-sm font-medium tracking-tight"
      >
        <span className="text-neutral-500">{"<"}</span>
        codestash
        <span className="text-neutral-500">{"/>"}</span>
      </Link>

      <div className="mx-auto w-full max-w-md">
        <SidebarSearch />
      </div>

      <SidebarUser />
    </header>
  );
}
