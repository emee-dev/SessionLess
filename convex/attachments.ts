import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createAttachment = mutation({
  args: {
    fileName: v.string(),
    eventId: v.id("events"),
    fileId: v.optional(v.id("_storage")),
    fileUrl: v.optional(v.string()),
  },
  async handler(ctx, args) {
    await ctx.db.insert("attachments", {
      fileName: args.fileName,
      eventId: args.eventId,
      fileId: args.fileId,
      fileUrl: args.fileUrl,
    });
  },
});

export const listAttachments = query({
  args: {
    paginationOpts: paginationOptsValidator,
    eventId: v.id("events"),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("attachments")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
