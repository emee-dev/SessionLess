"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { PaginatedDataTable } from "./data-table";
import { columns, EventTask } from "./organizer-tables/tasksColumn";
import { CreateTasks } from "./organizer-tables/tasksSheet";

export type Event = Doc<"events">;

export const mockEventTasks: EventTask[] = [
  {
    _id: "eventTask_001" as Id<"eventTasks">,
    _creationTime: 1756764000000,
    eventId: "event_001" as Id<"events">,
    name: "Speaker Bio",
    requirements: [
      {
        required: true,
        type: "text",
        id: "bio",
        label: "Provide a short biography (150–300 words)",
      },
    ],
  },
  {
    _id: "eventTask_002" as Id<"eventTasks">,
    _creationTime: 1756767600000,
    eventId: "event_001" as Id<"events">,
    name: "Headshot",
    requirements: [
      {
        required: true,
        type: "text",
        id: "headshot_url",
        label: "Upload a professional headshot",
      },
    ],
  },
  {
    _id: "eventTask_003" as Id<"eventTasks">,
    _creationTime: 1756771200000,
    eventId: "event_001" as Id<"events">,
    name: "Presentation Slides",
    requirements: [
      {
        required: true,
        type: "text",
        id: "slides_url",
        label: "Provide the link to your presentation slides",
      },
      {
        required: false,
        type: "checkbox",
        id: "slides_final",
        label: "I confirm that these are my final presentation slides",
      },
    ],
  },
  {
    _id: "eventTask_004" as Id<"eventTasks">,
    _creationTime: 1756774800000,
    eventId: "event_001" as Id<"events">,
    name: "Speaker Agreement",
    requirements: [
      {
        required: true,
        type: "checkbox",
        id: "agreement",
        label: "I agree to the speaker terms and conditions",
      },
    ],
  },
  {
    _id: "eventTask_005" as Id<"eventTasks">,
    _creationTime: 1756778400000,
    eventId: "event_001" as Id<"events">,
    name: "Session Details",
    requirements: [
      {
        required: false,
        type: "text",
        id: "session_title",
        label: "Confirm your session title",
      },
      {
        required: true,
        type: "text",
        id: "session_description",
        label: "Provide a brief description of your session",
      },
      {
        required: false,
        type: "checkbox",
        id: "technical_requirements",
        label: "I have reviewed the technical requirements",
      },
      {
        required: true,
        type: "text",
        id: "session_title1",
        label: "Confirm your session name",
      },
      {
        required: true,
        type: "text",
        id: "session_description1",
        label: "Provide a brief description of your background",
      },
      {
        required: true,
        type: "checkbox",
        id: "technical_requirements1",
        label: "I have reviewed the laptop requirements",
      },
    ],
  },
];

export function TasksPage() {
  const eventId = "";
  const {
    results: tasks = [],
    loadMore,
    status,
    isLoading,
  } = usePaginatedQuery(api.tasks.listEventTasks, "skip", {
    initialNumItems: 10,
  });

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center pt-10">
  //       <Empty className="w-full">
  //         <EmptyHeader>
  //           <EmptyMedia variant="icon">
  //             <Spinner />
  //           </EmptyMedia>
  //           <EmptyTitle>Processing your request</EmptyTitle>
  //           <EmptyDescription>
  //             Please wait while we load the event tasks. Do not refresh the
  //             page.
  //           </EmptyDescription>
  //         </EmptyHeader>
  //       </Empty>
  //     </div>
  //   );
  // }

  return (
    <>
      <section>
        <header className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-semibold tracking-[-0.01em]">Tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your speaker assigned tasks here
            </p>
          </div>

          <CreateTasks eventId={eventId} />
        </header>
      </section>

      <PaginatedDataTable
        columns={columns}
        data={mockEventTasks}
        loadMore={loadMore}
        status={status}
      />
    </>
  );
}
