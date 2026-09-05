"use client";

import {
  Circle,
  FileText,
  Folder,
  Home as HomeIcon,
  ListTodo,
  LogOut,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { mockAttachments } from "@/components/attachments";
import { PaginatedDataTable } from "@/components/data-table";
import { attachmentColumns } from "@/components/organizer-tables/attachmentColumn";
import { abstractsColumns } from "@/components/speaker-tables/abstractsColumn";
import { tasksColumns as tasksColumn } from "@/components/speaker-tables/tasksColumn";
import { mockEventTasks } from "@/components/tasks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { layouts } from "@/lib/constant";
import { mockSubmissions } from "../~/page";

const submissions = [
  { title: "Draft: agent memory", type: "Breakout", status: "Draft" },
  {
    title: "Scaling LLM agents in production",
    type: "Breakout",
    status: "Rejected",
  },
  { title: "Eval-driven agent design", type: "Breakout", status: "Pending" },
  { title: "From RAG to riches", type: "Featured Keynote", status: "Accepted" },
  { title: "Agents in the enterprise", type: "Breakout", status: "Accepted" },
];

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

const tabItems = [
  { label: "Home", icon: HomeIcon },
  { label: "Submissions", icon: FileText },
  { label: "Profile", icon: User },
  { label: "Tasks", icon: ListTodo },
  { label: "Files", icon: Folder },
];

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Draft: "border-border bg-muted text-muted-foreground",
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-red-200 bg-red-50 text-red-700",
    Complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles]}>
      <Circle className="size-1.5 fill-current" />
      {status}
    </Badge>
  );
}

export function SpeakerPortal() {
  const router = useRouter();
  const slug = useSearchParams();
  // const [tab, setTab] = useState(slug.get(layouts.Page) ?? "home");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[834px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-7">
        <Tabs
          // defaultValue={tab}
          // onValueChange={(v) => router.push(`/portal?${layouts.Page}=${v}`)}
          defaultValue={slug.get(layouts.Page) ?? "home"}
          onValueChange={(v) => router.push(`/portal?${layouts.Page}=${v}`)}
        >
          <header className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-1 rounded-full bg-teal-700"
                  aria-hidden="true"
                />
                <div>
                  <h1 className="text-base font-semibold leading-5">
                    Speaker Portal
                  </h1>
                  <p className="text-xs leading-5 text-muted-foreground">
                    AI.Engineer Sandbox Event
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <LogOut data-icon="inline-start" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>

            <TabsList
              variant="line"
              className="hidden h-9 sm:flex w-full rounded-lg"
            >
              {tabItems.map(({ label, icon: Icon }) => (
                <TabsTrigger
                  key={label}
                  value={label.toLowerCase()}
                  className="flex items-center gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Select
              // defaultValue="Home"
              // value={tab}
              // onValueChange={(v) => setTab(v as string)}
              defaultValue={slug.get(layouts.Page) ?? "home"}
              onValueChange={(v) => router.push(`/portal?${layouts.Page}=${v}`)}
            >
              <SelectTrigger className="mb-2 h-9 w-full sm:hidden">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {["Home", "Submissions", "Profile", "Tasks", "Files"].map(
                  (item) => (
                    <SelectItem key={item} value={item.toLowerCase()}>
                      {item}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </header>

          <Home />
          <Submissions />
          <Tasks />
          <Files />
        </Tabs>
      </div>
    </main>
  );
}

function Home() {
  const [activeTab, setActiveTab] = useState("All");
  return (
    <TabsContent value="home" className="flex flex-col gap-6 py-6 sm:py-7">
      <Card>
        <CardContent className="px-4 py-4 sm:px-4">
          <h2 className="text-base font-semibold">Welcome, Sam</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Track your submissions, keep your speaker profile current, and
            complete your tasks — all in one place.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-semibold">MY SUBMISSIONS</h2>
              <span className="text-xs text-muted-foreground">36</span>
            </div>
            <Button variant="link" className="h-auto p-0 text-sm text-teal-700">
              View all
            </Button>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex flex-col">
              {submissions.map((item, index) => (
                <div key={item.title}>
                  <div className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <a
                        href="#"
                        className="text-base font-medium text-teal-700 underline-offset-2 hover:underline"
                      >
                        {item.title}
                      </a>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  {index < submissions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[404px]">
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <h2 className="text-xs font-semibold">My Profile</h2>
            <Button variant="link" className="h-auto p-0 text-sm text-teal-700">
              View more
            </Button>
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
                <div className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <a
                      href="#"
                      className="text-base font-medium text-teal-700 underline-offset-2 hover:underline"
                    >
                      {task.title}
                    </a>
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
    </TabsContent>
  );
}

function Submissions() {
  return (
    <TabsContent value="submissions" className="py-6 sm:py-7">
      <PaginatedDataTable columns={abstractsColumns} data={mockSubmissions} />
    </TabsContent>
  );
}

function Tasks() {
  return (
    <TabsContent value="tasks" className="py-6 sm:py-7">
      <PaginatedDataTable columns={tasksColumn} data={mockEventTasks} />
    </TabsContent>
  );
}

function Files() {
  return (
    <TabsContent value="files" className="py-6 sm:py-7">
      <PaginatedDataTable columns={attachmentColumns} data={mockAttachments} />
    </TabsContent>
  );
}
export default SpeakerPortal;
