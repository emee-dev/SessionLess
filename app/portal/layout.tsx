import { LogOut } from "lucide-react";
import { PortalSidebar } from "@/components/portal-sidebar";
import { ToggleTheme } from "@/components/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const DashboardLayout = ({ children }: LayoutProps<"/~">) => {
  return (
    <SidebarProvider>
      <PortalSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="px-3 flex items-center gap-x-1.5">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <LogOut data-icon="inline-start" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
            <ToggleTheme />
          </div>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
