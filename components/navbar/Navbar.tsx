// navbar.tsx
// → components/navbar.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { NavDropdownContent } from "@/components/navbar/nav-dropdown-content";
import { NavSearchDialog } from "@/components/navbar/nav-search-dialog";
import { NavOverlayMenu } from "./nav-overlay-menu";
import { CATEGORY_LIST } from "@/lib/constants/categories";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky bg-secondary-foreground top-0 z-40 w-full border-b border-border backdrop-blur text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-sm font-medium tracking-tight"
          >
            <span className="text-muted-foreground">{"<"}</span>
            codestash
            <span className="text-muted-foreground">{"/>"}</span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            {" "}
            <NavigationMenuList>
              {CATEGORY_LIST.map((category) => (
                <NavigationMenuItem key={category.key}>
                  <NavigationMenuTrigger className="text-sm  text-muted hover:text-black data-[state=open]:text-">
                    {category.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavDropdownContent
                      categoryKey={category.key}
                      categoryHref={category.href}
                      categoryLabel={category.label}
                    />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="text-muted-foreground flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-border  px-2.5 py-1.5 text-xs  transition-colors hover:text-white sm:flex"
            >
              <Search className="size-3.5 " />
              Search
              <kbd className="text-muted-background ml-1 rounded border border-border  px-1 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <NavOverlayMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <NavSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
