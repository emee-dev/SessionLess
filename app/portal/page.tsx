"use client";

import {
  Circle,
  FileText,
  Folder,
  Home as HomeIcon,
  ListTodo,
  User,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { mockAttachments } from "@/components/attachments";
import { Charts } from "@/components/charts";
import { PaginatedDataTable } from "@/components/data-table";
import { abstractSubmissionColumns } from "@/components/organizer-tables/abstractSubmissionColumns";
import { attachmentColumns } from "@/components/organizer-tables/attachmentColumn";
import { abstractsColumns } from "@/components/speaker-tables/abstractsColumn";
import { tasksColumns as tasksColumn } from "@/components/speaker-tables/tasksColumn";
import { mockEventTasks } from "@/components/tasks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { layouts, portal } from "@/lib/constant";
import { mockSubmissions } from "../~/page";

type Submissions = Doc<"submissions">;

// const mockSubmissions: Submissions[] = [
//   {
//     title: "Draft: agent memory",
//     track: "Breakout",
//     evaluation: "Draft",
//     editVersion: 0,
//     room: "Main Hall",
//     eventsId: "1" as Id<"events">,
//     abstractData: {},
//     participantData: {},
//     _id: "00" as Id<"submissions">,
//     _creationTime: Date.now(),
//     speakerId: "12" as Id<"speakers">,
//   },
//   {
//     title: "Scaling LLM agents in production",
//     track: "Breakout",
//     evaluation: "Rejected",
//     editVersion: 0,
//     room: "Hall 4",
//     eventsId: "1" as Id<"events">,
//     abstractData: {},
//     participantData: {},
//     _id: "00" as Id<"submissions">,
//     _creationTime: Date.now(),
//     speakerId: "12" as Id<"speakers">,
//   },
//   {
//     title: "Eval-driven agent design",
//     track: "Breakout",
//     evaluation: "Pending",
//     editVersion: 0,
//     room: "Hall 12",
//     eventsId: "1" as Id<"events">,
//     abstractData: {},
//     participantData: {},
//     _id: "00" as Id<"submissions">,
//     _creationTime: Date.now(),
//     speakerId: "12" as Id<"speakers">,
//   },
//   {
//     title: "From RAG to riches",
//     track: "Featured Keynote",
//     evaluation: "Accepted",
//     editVersion: 0,
//     room: "Main Hall",
//     eventsId: "1" as Id<"events">,
//     abstractData: {},
//     participantData: {},
//     _id: "00" as Id<"submissions">,
//     _creationTime: Date.now(),
//     speakerId: "12" as Id<"speakers">,
//   },
//   {
//     title: "Agents in the enterprise",
//     track: "Breakout",
//     evaluation: "Accepted",
//     editVersion: 0,
//     room: "Auditorium",
//     eventsId: "1" as Id<"events">,
//     abstractData: {},
//     participantData: {},
//     _id: "00" as Id<"submissions">,
//     _creationTime: Date.now(),
//     speakerId: "12" as Id<"speakers">,
//   },
// ];

const tasks = [
  {
    title: "Flight Reimbursement",
    meta: "Required · Due Oct 1, 2026",
    status: "Pending",
  },
  {
    title: "Hotel & Travel Reservations",
    meta: "Required · Due Oct 1, 2026",
    status: "Pending",
  },
  {
    title: "Presentation Upload",
    meta: "Required · Due Oct 1, 2026",
    status: "Complete",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Draft: "border-border bg-muted text-muted-foreground",
    Pending:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
    Accepted:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
    Rejected:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
    Complete:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  };

  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles]}>
      <Circle className="size-1.5 fill-current" />
      {status}
    </Badge>
  );
}

const PORTAL_PAGES: Record<string, React.ReactNode> = {
  [portal.Home]: <Home />,
  [portal.Submissions]: <Submissions />,
  //   [portal.Profile]: <Profile />,
  [portal.Tasks]: <Tasks />,
  [portal.Files]: <Files />,
};

export default function Page() {
  return (
    <main className="min-h-screen border-t border-border px-4 py-6 text-foreground sm:px-6 sm:py-7">
      <Suspense fallback={<>Loading page</>}>
        <PageHandler />
      </Suspense>
    </main>
  );
}

function resolveEventPage(
  slug: string | null,
  page: string | null,
): React.ReactNode {
  if (!slug) {
    return <div>Unknown page</div>;
  }

  // `/events?slug=my-event`
  if (!page) {
    return <Home />;
  }

  // `/events?slug=my-event&page=abstract`
  return PORTAL_PAGES[page] ?? <div>Unknown page</div>;
}

function PageHandler() {
  const query = useSearchParams();
  const slug = query.get(layouts.Slug);
  const page = query.get(layouts.Page);

  const isHome = slug === null && page === null;

  if (!isHome) return resolveEventPage(slug, page);

  return <Home />;
}

function Home() {
  const [activeTab, setActiveTab] = useState("All");
  const query = useSearchParams();
  const slug = query.get(layouts.Slug);

  return (
    <div className="flex flex-col gap-6 py-6x sm:py-7x">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-semibold">MY SUBMISSIONS</h2>
              <span className="text-xs text-muted-foreground">36</span>
            </div>
            <Link href={`/portal?slug=${slug}&page=${portal.Submissions}`}>
              <Button
                variant="ghost"
                className="h-auto p-0 text-sm hover:underline underline-offset-2"
              >
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex flex-col">
              {mockSubmissions.map((item, index) => (
                <div key={item.title}>
                  <div className="flex items-centerx justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="w-85 truncate">
                        <a
                          href="#"
                          className="text-basex font-medium text-teal-700x underline-offset-2 hover:underline"
                        >
                          {item.title}
                        </a>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.track}
                      </p>
                    </div>
                    <StatusBadge status={item.evaluation} />
                  </div>
                  {index < mockSubmissions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[404px]">
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <h2 className="text-xs font-semibold">MY PROFILE</h2>
            {/* <Button
              variant="link"
              className="h-auto p-0 text-sm text-teal-700x"
            >
              View more
            </Button> */}

            <Link href={`/portal?slug=${slug}&page=${portal.Profile}`}>
              <Button
                variant="ghost"
                className="h-auto p-0 text-sm hover:underline underline-offset-2"
              >
                View more
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 bg-blue-900 text-white">
                <AvatarFallback className="bg-blue-900 text-white">
                  SS
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Sam Speaker</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  speaker@example.com
                </p>
                <p className="text-xs leading-5 text-muted-foreground/70">
                  Staff Engineer · Agentic Labs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold">OTHERS</h2>
            <span className="text-xs text-muted-foreground">2 outstanding</span>
          </div>
          <div
            className="flex items-center gap-1"
            role="tablist"
            aria-label="Task filters"
          >
            {["All", "Tasks", "Files"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="h-7 px-3 text-xs"
              >
                {tab}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex flex-col">
            {tasks.map((task, index) => (
              <div key={task.title}>
                <div className="flex items-centerx justify-between gap-3 py-3">
                  <div>
                    <div className="w-85 truncate">
                      <a
                        href="#"
                        className="text-basex font-medium text-teal-700x underline-offset-2 hover:underline"
                      >
                        {task.title}
                      </a>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {task.meta}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                {index < tasks.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Submissions() {
  return (
    <>
      <section>
        <header className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-semibold tracking-[-0.01em]">Submissions</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your abstract submissions here
            </p>
          </div>
        </header>
      </section>

      <PaginatedDataTable columns={abstractsColumns} data={mockSubmissions} />
    </>
  );
}

function Tasks() {
  return (
    <>
      <section>
        <header className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-semibold tracking-[-0.01em]">Tasks</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your submission tasks here
            </p>
          </div>
        </header>
      </section>

      <PaginatedDataTable columns={tasksColumn} data={mockEventTasks} />
    </>
  );
}

function Files() {
  return (
    <>
      <section>
        <header className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-semibold tracking-[-0.01em]">Files</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your event attachments here
            </p>
          </div>
        </header>
      </section>

      <PaginatedDataTable columns={attachmentColumns} data={mockAttachments} />
    </>
  );
}
