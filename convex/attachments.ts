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
    eventId: v.id("events"),
    label: v.string(),
    message: v.optional(v.string()),

    type: v.union(v.literal("file"), v.literal("link")),

    fileName: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
  },
  async handler(ctx, args) {
    await ctx.db.insert("attachments", {
      label: args.label,
      fileName: args.fileName,
      eventId: args.eventId,
      storageId: args.storageId,
      url: args.url,
      message: args.message,
      type: args.type,
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
