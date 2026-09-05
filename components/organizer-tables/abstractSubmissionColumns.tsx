"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { CheckCircle2, UserRound, XCircle } from "lucide-react";
import { DataTableFeatures } from "@/components/data-table/features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "@/convex/_generated/dataModel";

export type AbstractSubmissions = Doc<"submissions">;

const columnHelper = createColumnHelper<
  DataTableFeatures,
  AbstractSubmissions
>();

function stringifyData(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

export function EvaluationBadge({
  evaluation,
}: {
  evaluation: AbstractSubmissions["evaluation"];
}): React.ReactNode {
  const config: Record<
    AbstractSubmissions["evaluation"],
    {
      label: string;
      className: string;
    }
  > = {
    Draft: {
      label: "Draft",
      className: "border-border bg-muted text-muted-foreground",
    },
    Pending: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    Accepted: {
      label: "Accepted",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    Rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  const { label, className } = config[evaluation];

  return (
    <Badge variant="secondary" className={`font-medium ${className}`}>
      {label}
    </Badge>
  );
}

export const abstractSubmissionColumns = columnHelper.columns([
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
        <div className="min-w-0 max-w-[320px]">
          <p className="truncate font-medium">{submission.title}</p>
          {/* <p className="text-muted-foreground truncate text-xs">
            Submission #{row.index + 1}
          </p> */}
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

  columnHelper.display({
    id: "actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const submission: AbstractSubmissions = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="rounded-lg">
                Open
              </Button>
            }
          />
          <DropdownMenuContent className="w-46 font-sans">
            <DropdownMenuItem>
              <UserRound />
              Open in new Tab
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CheckCircle2 />
              Accept
            </DropdownMenuItem>
            <DropdownMenuItem>
              <XCircle />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
]);
