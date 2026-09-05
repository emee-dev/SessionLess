import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
  }),

  events: defineTable({
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

    // Analytics
    totalSubmissions: v.number(),
    totalSpeakers: v.number(),
    submissionsByTrack: v.array(
      v.object({
        track: v.string(),
        submissions: v.number(),
      }),
    ),
    submissionsByRoom: v.array(
      v.object({
        room: v.string(),
        submissions: v.number(),
      }),
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_event_slug", ["slug"])
    .index("by_userId_and_slug", ["userId", "slug"]),

  speakers: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
  }).index("by_userId", ["userId"]),

  eventTasks: defineTable({
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
  }).index("by_eventId", ["eventId"]),

  // Initialize this record for all speakers after creating the task record
  // then query status of the values object
  task_responses: defineTable({
    eventTaskId: v.id("eventTasks"),
    eventId: v.id("events"),
    userId: v.string(),

    name: v.string(),
    values: v.array(
      v.object({
        id: v.string(),
        type: v.union(v.literal("text"), v.literal("checkbox")),
        label: v.string(),
        value: v.union(v.string(), v.boolean()),
      }),
    ),

    isComplete: v.boolean(),
  })
    .index("by_event_taskId", ["eventTaskId"])
    .index("by_userId", ["userId"]),

  welcomeForms: defineTable({
    eventId: v.id("events"),
    content: v.string(),
  }).index("by_eventId", ["eventId"]),

  abstractForms: defineTable({
    eventId: v.id("events"),
    content: v.string(),
    visibleFormFields: v.array(v.string()),
  }).index("by_eventId", ["eventId"]),

  participantForms: defineTable({
    eventId: v.id("events"),
    content: v.string(),
  }).index("by_eventId", ["eventId"]),

  confirmationForms: defineTable({
    eventId: v.id("events"),
    content: v.string(),
  }).index("by_eventId", ["eventId"]),

  attachments: defineTable({
    eventId: v.id("events"),
    label: v.string(),
    message: v.optional(v.string()),

    type: v.union(v.literal("file"), v.literal("link")),

    fileName: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
  }).index("by_eventId", ["eventId"]),
  submissions: defineTable({
    eventsId: v.id("events"),
    speakerId: v.id("speakers"),
    title: v.string(),
    track: v.string(),
    room: v.string(),

    abstractData: v.record(v.string(), v.any()),
    participantData: v.record(v.string(), v.any()),
    evaluation: v.union(
      // v.literal("pending"),
      // v.literal("rejected"),
      // v.literal("accepted"),
      v.literal("Draft"),
      v.literal("Pending"),
      v.literal("Rejected"),
      v.literal("Accepted"),
    ),
    // Starts at 0 meaning it has not been edited
    // greater than 0 means it has been edited
    editVersion: v.number(),
  }),
});
