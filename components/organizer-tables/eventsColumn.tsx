"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { type DataTableFeatures } from "@/components/data-table/features";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";

export type Events = Doc<"events">;

const columnHelper = createColumnHelper<DataTableFeatures, Events>();

export const eventsColumns = columnHelper.columns([
  columnHelper.display({
    id: "serialNumber",
    header: () => <div className="w-10 text-center">#</div>,
    cell: ({ row }) => <div className="w-10 text-center">{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  }),

  columnHelper.accessor("eventName", {
    header: "NAME",
    cell: ({ row }) => (
      <Link
        href={`?slug=${row.original.slug}`}
        className="underline underline-offset-2"
      >
        {row.original.eventName}
      </Link>
    ),
  }),

  columnHelper.accessor("location", {
    header: "LOCATION",
  }),

  columnHelper.accessor("startsAt", {
    header: "START DATE",
    cell: ({ row }) => {
      const date = new Date(row.original.startsAt);

      return (
        <div>
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  }),

  columnHelper.accessor("endsAt", {
    header: "END DATE",
    cell: ({ row }) => {
      const date = new Date(row.original.endsAt);

      return (
        <div>
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  }),

  columnHelper.accessor("submissionDeadline", {
    header: "SUBMISSION DEADLINE",
    cell: ({ row }) => {
      const date = new Date(row.original.submissionDeadline);

      return (
        <div>
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  }),

  columnHelper.accessor("website", {
    header: "LINK",
    cell: ({ row }) => {
      const website = row.original.website;

      return website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Visit
        </a>
      ) : (
        "-"
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="outline" disabled>
          More
        </Button>
      );
    },
  }),
]);
