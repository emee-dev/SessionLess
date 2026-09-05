"use client";

import { usePaginatedQuery } from "convex/react";
import { BookmarkIcon } from "lucide-react";
import { PaginatedDataTable } from "@/components/data-table";
import {
  Attachment,
  attachmentColumns,
} from "@/components/organizer-tables/attachmentColumn";
import { CreateAttachmentSheet } from "@/components/organizer-tables/attachmentSheet";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

export type Event = Doc<"events">;

export const mockAttachments: Attachment[] = [
  {
    _id: "attachment_001" as Id<"attachments">,
    _creationTime: Date.now(),
    eventId: "event_001" as Id<"events">,
    label: "Speaker Guide",
    message:
      "Please review this guide before the event for important information about your session.",
    fileName: "speaker-guide.pdf",
    storageId: "storage_001" as Id<"_storage">,
    type: "file",
    downloadURL: "https://localhost:3000",
  },
  {
    _id: "attachment_002" as Id<"attachments">,
    _creationTime: Date.now(),
    eventId: "event_001" as Id<"events">,
    label: "Venue Information",
    message:
      "Find information about the venue, parking, accommodation, and nearby restaurants.",
    fileName: "venue-information.pdf",
    storageId: "storage_002" as Id<"_storage">,
    type: "file",
  },
  {
    _id: "attachment_003" as Id<"attachments">,
    _creationTime: Date.now(),
    eventId: "event_001" as Id<"events">,
    label: "Presentation Template",
    message:
      "Use this template when preparing your presentation for the event.",
    fileName: "presentation-template.pptx",
    storageId: "storage_003" as Id<"_storage">,
    type: "file",
  },
  {
    _id: "attachment_004" as Id<"attachments">,
    _creationTime: Date.now(),
    eventId: "event_001" as Id<"events">,
    label: "Event Website",
    message:
      "Visit the event website for the latest announcements and schedule updates.",
    url: "https://example.com/event",
    type: "link",
  },
  {
    _id: "attachment_005" as Id<"attachments">,
    _creationTime: Date.now(),
    eventId: "event_001" as Id<"events">,
    label: "Speaker Resources",
    message: "Additional resources and materials for preparing your session.",
    url: "https://example.com/resources",
    type: "link",
  },
];

export function AttachmentsPage() {
  const eventId = "";
  const {
    results: attachments = [],
    loadMore,
    status,
  } = usePaginatedQuery(api.attachments.listAttachments, "skip", {
    initialNumItems: 10,
  });

  // if (attachments.length === 0) {
  //   return (
  //     <div className="flex items-center justify-center pt-10">
  //       <Empty className="py-16">
  //         <EmptyHeader>
  //           <EmptyMedia variant="icon">
  //             <BookmarkIcon />
  //           </EmptyMedia>
  //           <EmptyTitle>No Attachments</EmptyTitle>
  //           <EmptyDescription>
  //             Uploaded attachments will be saved here for easy access.
  //           </EmptyDescription>
  //           <CreateAttachmentSheet eventId={eventId} variant="default" />
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
            <h1 className="font-semibold tracking-[-0.01em]">Attachments</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your event related attachments here
            </p>
          </div>

          <CreateAttachmentSheet eventId={eventId} />
        </header>
      </section>

      <PaginatedDataTable
        columns={attachmentColumns}
        // data={attachments}
        data={mockAttachments}
        loadMore={loadMore}
        status={status}
      />
    </>
  );
}
