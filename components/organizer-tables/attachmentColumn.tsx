"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  Download,
  ExternalLink,
  File,
  FileText,
  Link2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { DataTableFeatures } from "@/components/data-table/features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "@/convex/_generated/dataModel";
import { getFileExtension, getHostname } from "@/lib/utils";

export type Attachment = Doc<"attachments"> & {
  downloadURL?: string;
};

const columnHelper = createColumnHelper<DataTableFeatures, Attachment>();

export const attachmentColumns = columnHelper.columns([
  columnHelper.display({
    id: "serialNumber",
    header: () => <div className="w-10 text-center">#</div>,
    cell: ({ row }) => <div className="w-10 text-center">{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  }),

  columnHelper.accessor("fileName", {
    header: "NAME",
    cell: ({ row }) => {
      const attachment: Attachment = row.original;
      const isFile = row.original.type === "file";

      return (
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{attachment.label}</p>

            {isFile && getFileExtension(attachment.fileName as string) ? (
              <p className="text-muted-foreground text-xs">
                {getFileExtension(attachment.fileName as string)}
              </p>
            ) : null}
          </div>
        </div>
      );
    },
  }),

  columnHelper.accessor("message", {
    header: "MESSAGE",
    cell: ({ row }) => {
      const attachment: Attachment = row.original;

      return (
        <div className="flex min-w-0 items-center gap-2 w-56">
          <p className="truncate font-medium">{attachment.message}</p>
        </div>
      );
    },
  }),

  columnHelper.display({
    id: "type",
    header: () => <div className="text-center">TYPE</div>,
    cell: ({ row }) => {
      const isFile = row.original.type === "file";

      return (
        <div className="flex justify-center">
          <Badge className="rounded-sm w-fit" variant="outline">
            {isFile ? (
              <File className="size-3.5" />
            ) : (
              <Link2 className="size-3.5" />
            )}

            {isFile ? "File" : "Link"}
          </Badge>
        </div>
      );
    },
  }),

  columnHelper.display({
    id: "attachment",
    header: "ATTACHMENT",
    cell: ({ row }) => {
      const attachment: Attachment = row.original;
      const isFile = row.original.type === "file";

      if (isFile) {
        if (!attachment.downloadURL) {
          return (
            <span className="text-muted-foreground text-sm">
              File unavailable
            </span>
          );
        }

        return (
          <a
            href={attachment.downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 max-w-[320px] items-center gap-2"
          >
            <span className="truncate text-sm underline-offset-4 group-hover:underline">
              {attachment.fileName}
            </span>

            <Download className="text-muted-foreground size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        );
      }

      if (!attachment.url) {
        return (
          <span className="text-muted-foreground text-sm">
            Link unavailable
          </span>
        );
      }

      return (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-w-0 max-w-[320px] items-center gap-2"
          title={attachment.url}
        >
          <div className="min-w-0">
            <p className="truncate text-sm group-hover:underline">
              {attachment.url}
            </p>
          </div>
        </a>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const attachment = row.original;
      const isFile = row.original.type === "file";
      const url = isFile ? attachment.downloadURL : attachment.url;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Attachment actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />

          <DropdownMenuContent align="end" className="w-45">
            {url && (
              <>
                <DropdownMenuItem>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    {isFile ? (
                      <Download className="mr-2 size-4" />
                    ) : (
                      <ExternalLink className="mr-2 size-4" />
                    )}
                    {isFile ? "Download file" : "Open in new tab"}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem variant="destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
]);
