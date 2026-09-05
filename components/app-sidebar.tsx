"use client";

import {
  ArrowRight01Icon,
  ArrowUpRightIcon,
  Attachment01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  FileEditIcon,
  Home,
  LinkIcon,
  MoreHorizontalCircle01Icon,
  Settings05Icon,
  SmartPhone01Icon,
  StarOffIcon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { layouts } from "@/lib/constant";

export type Event = {
  eventName: string;
  slug: string;
};

export type AppSidebarEventPage = {
  name: string;
  url: string;
  icon: React.ReactNode;
};

export type AppSidebarEvent = {
  url: string;
  icon: React.ReactNode;
  pages: AppSidebarEventPage[];
} & Event;

export type AppLinkPage = {
  name: string;
  url: string;
  icon: React.ReactNode;
};

export type AppLinks = {
  title: string;
  url: string;
  icon: React.ReactNode;
  isActive?: boolean;
  pages?: AppLinkPage[];
};

const eventLinks: AppLinks[] = [
  {
    title: "Home",
    url: "/~",
    icon: <HugeiconsIcon icon={Home} strokeWidth={2} />,
  },
  {
    title: "Calendar",
    url: "/~/calendar",
    icon: <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />,
  },
  {
    title: "Attachments",
    url: "/~/attachments",
    icon: <HugeiconsIcon icon={Attachment01Icon} strokeWidth={2} />,
  },
  {
    title: "Tasks",
    url: "/~/tasks",
    icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <AppLogo />
        <React.Suspense fallback={<>loading links</>}>
          <SidebarLinks items={eventLinks} />
        </React.Suspense>
      </SidebarHeader>
      <SidebarContent>
        <React.Suspense fallback={<>loading links</>}>
          <EventFormTabs />
        </React.Suspense>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarLinks({ items }: { items: AppLinks[] }) {
  const query = useSearchParams();

  const eventSlug: string | null = query.get(layouts.Slug);
  const eventDependentUrls: string[] = [
    "/~/calendar",
    "/~/tasks",
    "/~/attachments",
  ];

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isEventDependent: boolean = eventDependentUrls.includes(item.url);
        const isDisabled: boolean = isEventDependent && !eventSlug;

        const href: string =
          isEventDependent && eventSlug
            ? `/~?slug=${encodeURIComponent(eventSlug)}&page=${item.url.replace("/~/", "")}`
            : item.url;

        if (!item.pages || item.pages.length === 0) {
          return (
            <SidebarMenuItem key={item.title} aria-disabled={isDisabled}>
              <SidebarMenuButton
                isActive={item.isActive}
                disabled={isDisabled}
                render={isDisabled ? undefined : <Link href={href} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        return null;
      })}
    </SidebarMenu>
  );
}

function EventFormTabs() {
  const query = useSearchParams();
  const eventSlug = query.get("slug");
  const { isMobile } = useSidebar();

  const items = React.useMemo(() => {
    if (!eventSlug) return [];

    return [
      {
        title: "Welcome Page",
        url: `/~?${layouts.Slug}=${eventSlug}&${layouts.Page}=welcome`,
        icon: (
          <HugeiconsIcon icon={SmartPhone01Icon} strokeWidth={2} size={15} />
        ),
      },
      {
        title: "Abstract Form",
        url: `/~?${layouts.Slug}=${eventSlug}&${layouts.Page}=abstract`,
        icon: <HugeiconsIcon icon={FileEditIcon} strokeWidth={2} size={15} />,
      },
      {
        title: "Participant Form",
        url: `/~?${layouts.Slug}=${eventSlug}&${layouts.Page}=participant`,
        icon: <HugeiconsIcon icon={UserEdit01Icon} strokeWidth={2} size={15} />,
      },
      {
        title: "Submission Confirmation",
        url: `/~?${layouts.Slug}=${eventSlug}&${layouts.Page}=confirmation`,
        icon: (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            size={15}
          />
        ),
      },
      {
        title: "Settings",
        url: `/~?${layouts.Slug}=${eventSlug}&${layouts.Page}=settings`,
        icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} size={15} />,
      },
    ] as AppLinks[];
  }, [eventSlug]);

  if (!eventSlug) return null;

  return (
    <SidebarGroup>
      <div className="flex items-center font-sans">
        <SidebarGroupLabel className="flex-1 text-sm text-muted-foreground">
          Event
        </SidebarGroupLabel>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuAction className="size-7 rounded-md aria-expanded:bg-muted" />
            }
          >
            <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
            <span className="sr-only">Event actions</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            {/* Favorite */}
            <DropdownMenuItem>
              <HugeiconsIcon
                icon={StarOffIcon}
                strokeWidth={2}
                className="text-muted-foreground"
              />
              <span>Remove from Favorites</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <HugeiconsIcon
                icon={LinkIcon}
                strokeWidth={2}
                className="text-muted-foreground"
              />
              <span>Copy Link</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <HugeiconsIcon
                icon={ArrowUpRightIcon}
                strokeWidth={2}
                className="text-muted-foreground"
              />
              <span>Open in New Tab</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Destructive */}
            <DropdownMenuItem variant="destructive">
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              <span>Delete Event</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            if (!item.pages || item?.pages?.length === 0) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    render={<Link href={item.url} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    render={<CollapsibleTrigger />}
                    className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-open:rotate-90"
                    showOnHover
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                  </SidebarMenuAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <SidebarMenuAction
                          showOnHover
                          className="aria-expanded:bg-muted"
                        />
                      }
                    >
                      <HugeiconsIcon
                        icon={MoreHorizontalCircle01Icon}
                        strokeWidth={2}
                      />
                      <span className="sr-only">More</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <HugeiconsIcon
                            icon={StarOffIcon}
                            strokeWidth={2}
                            className="text-muted-foreground"
                          />
                          <span>Remove from Favorites</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <HugeiconsIcon
                            icon={LinkIcon}
                            strokeWidth={2}
                            className="text-muted-foreground"
                          />
                          <span>Copy Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <HugeiconsIcon
                            icon={ArrowUpRightIcon}
                            strokeWidth={2}
                            className="text-muted-foreground"
                          />
                          <span>Open in New Tab</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            strokeWidth={2}
                            className="text-muted-foreground"
                          />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.pages.map((page) => {
                        // const pageActive = isPageActive(page);
                        return (
                          <SidebarMenuSubItem key={page.name}>
                            <SidebarMenuSubButton
                              render={<Link href={page.url} />}
                              // isActive={pageActive}
                            >
                              <span>{page.icon}</span>
                              <span>{page.name}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

type LogoProps = {
  name: string;
  logo?: React.ReactNode;
};

function Logo({ name, logo }: LogoProps): React.ReactNode {
  if (logo) {
    return (
      <div className="flex aspect-square size-5 items-center justify-center overflow-hidden rounded-md">
        {logo}
      </div>
    );
  }

  return (
    <>
      <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-xs font-medium text-sidebar-primary-foreground">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <span className="truncate font-medium">{name}</span>
    </>
  );
}
export function AppLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center font-sans gap-x-1.5">
        <Logo name="Sessionless" logo={undefined} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
