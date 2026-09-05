"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTableFeatures } from "@/components/data-table/features";
import { Doc } from "@/convex/_generated/dataModel";
import { EvaluationBadge } from "../organizer-tables/abstractSubmissionColumns";

export type AbstractSubmissions = Doc<"submissions">;

const columnHelper = createColumnHelper<
  DataTableFeatures,
  AbstractSubmissions
>();

function stringifyData(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

export const abstractsColumns = columnHelper.columns([
  columnHelper.display({
    id: "serialNumber",
    header: () => <div className="w-10 text-center">#</div>,
    cell: ({ row }) => (
      <div className="text-muted-foreground w-10 text-center tabular-nums">
        {row.index + 1}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }),

  columnHelper.accessor("evaluation", {
    header: () => <div className="w-full text-center">STATUS</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <EvaluationBadge evaluation={row.original.evaluation} />
      </div>
    ),
  }),

  columnHelper.accessor("title", {
    header: "TITLE",
    cell: ({ row }) => {
      const submission: AbstractSubmissions = row.original;

      return (
        <div className="min-w-0 max-w-[90px] md:max-w-[320px]">
          <p className="truncate font-medium">{submission.title}</p>
        </div>
      );
    },
  }),

  columnHelper.accessor("abstractData", {
    header: "ABSTRACT DATA",
    cell: ({ row }) => {
      const value: string = stringifyData(row.original.abstractData);

      return (
        <div
          className="text-muted-foreground max-w-[60px] truncate font-mono text-xs"
          title={value}
        >
          {value}
        </div>
      );
    },
  }),

  columnHelper.accessor("participantData", {
    header: "PARTICIPANT DATA",
    cell: ({ row }) => {
      const value: string = stringifyData(row.original.participantData);

      return (
        <div
          className="text-muted-foreground max-w-[60px] truncate font-mono text-xs"
          title={value}
        >
          {value}
        </div>
      );
    },
  }),
]);
