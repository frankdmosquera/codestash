import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* bg-transparent overrides SidebarInset's default opaque bg-background,
          which otherwise paints over each page's own fixed/-z-10 decorative
          background (GitGraphBackground, ManualsBackground, etc.) */}
      <SidebarInset className="bg-transparent">
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
