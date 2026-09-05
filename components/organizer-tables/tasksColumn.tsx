"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTableFeatures } from "@/components/data-table/features";
import { Badge } from "@/components/ui/badge";
import { Doc } from "@/convex/_generated/dataModel";
import { EditTasks, UpdateTask } from "./tasksSheet";

export type EventTask = Doc<"eventTasks">;
export type Requirement = EventTask["requirements"][number];

const columnHelper = createColumnHelper<DataTableFeatures, EventTask>();

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "serialNumber",
    header: () => <div className="w-10 text-center">#</div>,
    cell: ({ row }) => <div className="w-10 text-center">{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  }),

  columnHelper.accessor("name", {
    header: "NAME",
  }),

  columnHelper.accessor("requirements", {
    header: "REQUIREMENTS",
    cell: ({ row }) => {
      const requirements: Requirement[] = row.original.requirements;

      return (
        <Badge className="rounded-sm w-fit" variant="outline">
          {requirements.length} tasks
        </Badge>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <EditTasks task={row.original as unknown as UpdateTask} />
    ),
  }),
]);
