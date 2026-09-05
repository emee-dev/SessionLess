"use client";

import { useMutation } from "convex/react";
import { FileIcon, FileTextIcon, Link2Icon, XIcon } from "lucide-react";
import * as React from "react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Textarea } from "../ui/textarea";

type Attachment = Doc<"attachments">;

export interface CreateAttachmentProps {
  eventId: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

type AttachmentType = Attachment["type"];

export interface CreateAttachmentProps {
  eventId: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export function CreateAttachmentSheet(
  props: CreateAttachmentProps,
): React.ReactElement {
  const [open, setOpen] = React.useState<boolean>(false);
  const [type, setType] = React.useState<AttachmentType>("file");
  const [label, setLabel] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  const [file, setFile] = React.useState<File | null>(null);
  const [url, setUrl] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const generateUploadUrl = useMutation(api.attachments.generateUploadUrl);
  const createAttachment = useMutation(api.attachments.createAttachment);

  const reset = React.useCallback((): void => {
    setType("file");
    setLabel("");
    setMessage("");
    setFile(null);
    setUrl("");
    setIsSaving(false);
  }, []);

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const handleTypeChange = (value: string): void => {
    const nextType: AttachmentType = value as AttachmentType;

    setType(nextType);

    if (nextType === "file") {
      setUrl("");
    } else {
      setFile(null);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = (): void => {
    setFile(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!label.trim()) {
      return;
    }

    if (type === "file" && !file) {
      return;
    }

    if (type === "link" && !url.trim()) {
      return;
    }

    try {
      setIsSaving(true);

      const eventId = props.eventId as Id<"events">;

      if (type === "file" && file) {
        const postUrl: string = await generateUploadUrl();

        const response: Response = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!response.ok) {
          throw new Error("Failed to upload attachment");
        }

        const { storageId }: { storageId: Id<"_storage"> } =
          await response.json();

        await createAttachment({
          label: label.trim(),
          eventId,
          fileName: file.name,
          storageId,
          type: "file",
          message: message.trim() || undefined,
        });
      } else {
        await createAttachment({
          label: label.trim(),
          eventId,
          url: url.trim(),
          type: "link",
          message: message.trim() || undefined,
        });
      }

      setOpen(false);
      reset();
    } catch (error: unknown) {
      console.error("Failed to create attachment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const canSave: boolean =
    !isSaving &&
    label.trim().length > 0 &&
    (type === "file" ? file !== null : url.trim().length > 0);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button variant={props.variant ?? "outline"}>
            <FileIcon />
            New Attachment
          </Button>
        }
      />

      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Add attachment</SheetTitle>

          <SheetDescription>
            Add a resource that will be available to participants. You can
            upload a file or provide a link to an external resource.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 thin-scrollbar">
          <div className="grid gap-6">
            {/* Label */}
            <div className="grid gap-3">
              <Label htmlFor="attachment-label">LABEL</Label>

              <Input
                id="attachment-label"
                value={label}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setLabel(event.target.value)
                }
                placeholder="e.g. Speaker guide"
                disabled={isSaving}
                className="rounded-lg"
              />

              <p className="text-muted-foreground text-xs">
                A short name that participants will see for this resource.
              </p>
            </div>

            <div className="grid gap-3">
              <Label>ATTACHMENT TYPE</Label>

              <RadioGroup
                value={type}
                onValueChange={handleTypeChange}
                className="max-w-sm"
              >
                <FieldLabel htmlFor="attachment-type-file">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>File</FieldTitle>
                      <FieldDescription>
                        Upload a document, image, guide, or other resource.
                      </FieldDescription>
                    </FieldContent>

                    <RadioGroupItem
                      value="file"
                      id="attachment-type-file"
                      className="rounded-full"
                    />
                  </Field>
                </FieldLabel>

                <FieldLabel htmlFor="attachment-type-link">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Link</FieldTitle>
                      <FieldDescription>
                        Link to an external website or online document.
                      </FieldDescription>
                    </FieldContent>

                    <RadioGroupItem
                      value="link"
                      id="attachment-type-link"
                      className="rounded-full"
                    />
                  </Field>
                </FieldLabel>
              </RadioGroup>
            </div>

            {type === "file" ? (
              <div className="grid gap-3">
                <Label>FILE</Label>

                {file ? (
                  <Attachment
                    state={isSaving ? "uploading" : undefined}
                    className="w-full"
                  >
                    <AttachmentMedia>
                      {isSaving ? <Spinner /> : <FileTextIcon />}
                    </AttachmentMedia>

                    <AttachmentContent>
                      <AttachmentTitle>{file.name}</AttachmentTitle>

                      <AttachmentDescription>
                        {isSaving
                          ? "Uploading..."
                          : `${file.type || "File"} · ${formatFileSize(file.size)}`}
                      </AttachmentDescription>
                    </AttachmentContent>

                    {!isSaving ? (
                      <AttachmentActions>
                        <AttachmentAction
                          aria-label={`Remove ${file.name}`}
                          onClick={removeFile}
                        >
                          <XIcon />
                        </AttachmentAction>
                      </AttachmentActions>
                    ) : null}
                  </Attachment>
                ) : (
                  <label
                    htmlFor="attachment-file"
                    className="hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors"
                  >
                    <div className="bg-muted flex size-10 items-center justify-center rounded-full">
                      <FileIcon className="text-muted-foreground size-5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">Choose a file</p>

                      <p className="text-muted-foreground mt-1 text-xs">
                        PDF, images, documents, and other supported files
                      </p>
                    </div>
                  </label>
                )}

                <Input
                  id="attachment-file"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isSaving}
                />
              </div>
            ) : (
              <div className="grid gap-3">
                <Label htmlFor="attachment-url">URL</Label>

                <div className="relative">
                  <Link2Icon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                  <Input
                    id="attachment-url"
                    type="url"
                    value={url}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setUrl(event.target.value)
                    }
                    placeholder="https://example.com/speaker-guide"
                    className="rounded-lg pl-9"
                    disabled={isSaving}
                  />
                </div>

                {url.trim() ? (
                  <Attachment className="w-full">
                    <AttachmentMedia>
                      <Link2Icon />
                    </AttachmentMedia>

                    <AttachmentContent>
                      <AttachmentTitle>
                        {label || "External link"}
                      </AttachmentTitle>

                      <AttachmentDescription>{url}</AttachmentDescription>
                    </AttachmentContent>
                  </Attachment>
                ) : null}
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="attachment-message">
                MESSAGE{" "}
                <span className="text-muted-foreground">(OPTIONAL)</span>
              </Label>

              <Textarea
                id="attachment-message"
                value={message}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setMessage(event.target.value)
                }
                placeholder="e.g. Please review this guide before arriving at the venue."
                disabled={isSaving}
                className="min-h-24 resize-none rounded-lg"
              />

              <p className="text-muted-foreground text-xs">
                Add context or instructions to help participants understand this
                resource.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter>
          <SheetClose
            render={
              <Button variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            }
          />

          <Button type="button" onClick={handleSave} disabled={!canSave}>
            {isSaving ? (
              <>
                <Spinner />
                {type === "file" ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                {type === "file" ? <FileIcon /> : <Link2Icon />}
                Add attachment
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units: string[] = ["Bytes", "KB", "MB", "GB"];
  const index: number = Math.floor(Math.log(bytes) / Math.log(1024));

  const size: number = bytes / Math.pow(1024, index);

  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
