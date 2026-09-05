export const TRACK = "track";
export const ROOM = "room";

export const layouts = {
  Slug: "slug",
  Page: "page",
} as const;

export const events = {
  Welcome: "welcome",
  Abstract: "abstract",
  Participant: "participant",
  Confirmation: "confirmation",
  Settings: "settings",

  // Pages
  Attachments: "attachments",
  Tasks: "tasks",
  Calendar: "calendar",
} as const;

export const portal = {
  // Portal tabs
  Home: "home",
  Submissions: "submissions",
  Profile: "profile",
  Tasks: "tasks",
  Files: "files",
} as const;
