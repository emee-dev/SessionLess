import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listEvents = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.string(),
  },
  async handler(ctx, args) {
    return ctx.db
      .query("events")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getEventBySlug = query({
  args: {
    userId: v.string(),
    slug: v.string(),
  },
  async handler(ctx, args) {
    return ctx.db
      .query("events")
      .withIndex("by_userId_and_slug", (q) =>
        q.eq("userId", args.userId).eq("slug", args.slug),
      )
      .first();
  },
});

export const isExistingSlug = query({
  args: {
    slug: v.string(),
  },
  async handler(ctx, args) {
    const result = await ctx.db
      .query("events")
      .withIndex("by_event_slug", (q) => q.eq("slug", args.slug))
      .first();

    return !!result;
  },
});

export const createEvent = mutation({
  args: {
    userId: v.string(),

    // Basic details
    eventName: v.string(),
    slug: v.string(),
    eventType: v.string(),
    website: v.string(),
    location: v.string(),
    tracks: v.array(v.string()),
    rooms: v.array(v.string()),
    theme: v.string(),
    startsAt: v.string(),
    endsAt: v.string(),

    // Deadline
    submissionDeadline: v.string(),
  },
  async handler(ctx, args) {
    return ctx.db.insert("events", {
      userId: args.userId,
      eventName: args.eventName,
      slug: args.slug,
      eventType: args.eventType,
      website: args.website,
      location: args.location,
      tracks: args.tracks,
      rooms: args.rooms,
      theme: args.theme,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      submissionDeadline: args.submissionDeadline,
      totalSubmissions: 0,
      totalSpeakers: 0,
      submissionsByRoom: [],
      submissionsByTrack: [],
    });
  },
});

export const updateEvent = mutation({
  args: {
    _id: v.id("events"),

    // Basic details
    eventName: v.optional(v.string()),
    slug: v.optional(v.string()),
    eventType: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    tracks: v.optional(v.array(v.string())),
    rooms: v.optional(v.array(v.string())),
    theme: v.optional(v.string()),
    startsAt: v.optional(v.string()),
    endsAt: v.optional(v.string()),

    // Deadline
    submissionDeadline: v.optional(v.string()),
  },
  async handler(ctx, args) {
    return ctx.db.patch(args._id, args);
  },
});
