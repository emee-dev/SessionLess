import { ResolveAttachment } from "./form-context";
import { ConvexUploadResult } from "./types";

export type UploadOptions = {
  eventId: string;
  formType: "participant" | "proposal";
};

export interface AttachmentContext {
  fieldId: string;
  file: File;
}

export interface AttachmentResult {
  url: string;
  metadata?: Record<string, unknown>;
}

export type UploadProvider = (
  context: AttachmentContext,
) => Promise<AttachmentResult>;

export function createUploadProvider(
  uploadUrl: string,
  opts: UploadOptions,
): UploadProvider {
  return async (ctx) => {
    const body = new FormData();

    body.append("file", ctx.file);
    body.append("fieldId", ctx.fieldId);
    body.append("eventId", opts.eventId);
    body.append("formType", opts.formType);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body,
    });

    if (!response.ok) {
      throw new Error(`File upload failed with status ${response.status}`);
    }

    const data: ConvexUploadResult = await response.json();

    return {
      url: data.storageId,
    };
  };
}

export function resolveAttachment(baseUrl: string): ResolveAttachment {
  return async ({ field, value }) => {
    if (!value) return null;

    const url = new URL(baseUrl);
    url.searchParams.set("storageId", value as string);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to load image");
    }

    const fileName = response.headers.get("fileName") as string;

    const blob = await response.blob();

    const file = new File([blob], fileName, {
      type: blob.type,
    });

    console.log("Resolved API Call");

    return file;
  };
}
