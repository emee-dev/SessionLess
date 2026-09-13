import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  httpAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";

export const uploadFieldAttachment = httpAction(async (ctx, req) => {
  try {
    const formData: FormData = await req.formData();
    const file = formData.get("file");
    const eventId = formData.get("eventId");
    const fieldId = formData.get("fieldId") as string;
    const formType = formData.get("formType") as "participant" | "proposal";

    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer]);

    const storageId = await ctx.storage.store(blob);

    await ctx.runMutation(internal.form.setFile, {
      eventId: eventId as Id<"events">,
      contentType: file.type || "application/octet-stream",
      fieldId: fieldId,
      fileName: file.name,
      storageId,
      formType
    });

    return Response.json({ storageId }, { status: 201 });
  } catch (error: unknown) {
    console.error("File upload failed:", error);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const resolveFieldAttachment = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const storageId = url.searchParams.get("storageId") as Id<"_storage">;

  if (!storageId) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  const [blob, file] = await Promise.all([
    ctx.storage.get(storageId),
    ctx.runQuery(internal.form.getFile, { storageId }),
  ]);

  if (!blob || !file) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  return new Response(blob, {
    status: 200,
    headers: {
      fileName: file.fileName ?? "",
      "Content-Type": file.contentType ?? "",
      "Content-Length": String(blob.size),
      ...(file.fileName
        ? {
            "Content-Disposition": `inline; filename="${file.fileName}"`,
          }
        : {}),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

export const getFile = internalQuery({
  args: {
    storageId: v.id("_storage"),
  },
  async handler(ctx, args) {
    return ctx.db
      .query("formAttachments")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .first();
  },
});

export const setFile = internalMutation({
  args: {
    fieldId: v.string(),
    eventId: v.id("events"),
    fileName: v.string(),
    contentType: v.string(),
    storageId: v.id("_storage"),
    formType: v.union(v.literal("participant"), v.literal("proposal")),
  },
  async handler(ctx, args) {
    const existingField = await ctx.db
      .query("formAttachments")
      .withIndex("by_fieldId_and_formType", (q) =>
        q.eq("fieldId", args.fieldId).eq("formType", args.formType),
      )
      .first();

    if (!existingField) {
      return Promise.all([
        ctx.db.insert("formAttachments", {
          fieldId: args.fieldId,
          eventId: args.eventId,
          contentType: args.contentType,
          fileName: args.fileName,
          storageId: args.storageId,
          formType: args.formType,
        }),
      ]);
    }

    await Promise.all([
      await ctx.storage.delete(existingField.storageId),
      await ctx.db.delete(existingField._id),
    ]);
  },
});
