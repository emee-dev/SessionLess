import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const listEventTasks = query({
  args: {
    paginationOpts: paginationOptsValidator,
    eventId: v.string(),
  },
  async handler(ctx, args) {
    return ctx.db
      .query("eventTasks")
      .withIndex("by_eventId", (q) =>
        q.eq("eventId", args.eventId as Id<"events">),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const createEventTask = mutation({
  args: {
    name: v.string(),
    eventId: v.id("events"),
    requirements: v.array(
      v.object({
        id: v.string(),
        type: v.union(v.literal("text"), v.literal("checkbox")),
        label: v.string(),
        required: v.boolean(),
      }),
    ),
  },
  async handler(ctx, args) {
    const taskId = await ctx.db.insert("eventTasks", args);

    const speakers = await ctx.db.query("speakers").collect();

    await Promise.all(
      speakers.map((speaker) =>
        ctx.db.insert("task_responses", {
          eventId: args.eventId,
          name: args.name,
          isComplete: false,
          eventTaskId: taskId,
          userId: speaker.userId,
          values: [],
        }),
      ),
    );
  },
});

export const updateEventTask = mutation({
  args: {
    _id: v.id("eventTasks"),
    name: v.string(),
    requirements: v.array(
      v.object({
        id: v.string(),
        type: v.union(v.literal("text"), v.literal("checkbox")),
        label: v.string(),
        required: v.boolean(),
      }),
    ),
  },
  async handler(ctx, args) {
    return ctx.db.patch(args._id, {
      name: args.name,
      requirements: args.requirements,
    });
  },
});

// Speaker portal
export const listTaskResponses = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.string(),
  },
  async handler(ctx, args) {
    return ctx.db
      .query("task_responses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const completeTask = mutation({
  args: {
    taskResponseId: v.id("task_responses"),
    values: v.array(
      v.object({
        id: v.string(),
        type: v.union(v.literal("text"), v.literal("checkbox")),
        label: v.string(),
        value: v.union(v.string(), v.boolean()),
      }),
    ),
    isComplete: v.boolean(),
  },
  async handler(ctx, args) {
    return ctx.db.patch(args.taskResponseId, {
      values: args.values,
      isComplete: args.isComplete,
    });
  },
});
