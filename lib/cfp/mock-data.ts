import type { CurrentUser, EventCfpConfig, SpeakerDoc } from "./types";

export const currentUser: CurrentUser = {
  _id: "user_maya",
  name: "Maya fidelis",
  email: "maya@northwind.co",
};

export const speakers: SpeakerDoc[] = [
  { _id: "spk_1", userId: "user_maya", eventId: "evt_solstice" },
];

export const eventCfpConfig: EventCfpConfig = {
  event: {
    _id: "evt_solstice",
    eventName: "Solstice Summit 2025",
    slug: "solstice-summit-2025",
    eventType: "In-person conference",
    website: "https://solstice.example",
    location: "Meridian Hall, Lakeside, Pacific North",
    tracks: ["Design Systems", "AI & ML", "Founders", "Leadership"],
    rooms: ["Meridian Hall", "Studio A", "The Loft"],
    theme: "Where the best ideas catch the light.",
    startsAt: "2025-10-14",
    endsAt: "2025-10-16",
    submissionDeadline: "2026-09-22",
    totalSubmissions: 1284,
    totalSpeakers: 412,
    submissionsByTrack: [
      { track: "Design Systems", submissions: 402 },
      { track: "AI & ML", submissions: 511 },
      { track: "Founders", submissions: 188 },
      { track: "Leadership", submissions: 183 },
    ],
    submissionsByRoom: [
      { room: "Meridian Hall", submissions: 640 },
      { room: "Studio A", submissions: 402 },
      { room: "The Loft", submissions: 242 },
    ],
    branding: {
      logoLabel: "Sessionless",
    },
  },
  welcomeForm: {
    content: `## Welcome, speaker

We're building a programme of **practical, generous talks** — the kind people quote back to their teams weeks later.

> Pitch the thing you wish someone had explained to you two years ago.

- Talks are 30 or 45 minutes; workshops run 90 minutes.
- First-time speakers are genuinely welcome — we offer rehearsal sessions.
- Accepted speakers get travel support and a companion ticket.

Submissions are reviewed anonymously by the programme committee.
## Welcome, speaker

We're building a programme of **practical, generous talks** — the kind people quote back to their teams weeks later.

> Pitch the thing you wish someone had explained to you two years ago.

- Talks are 30 or 45 minutes; workshops run 90 minutes.
- First-time speakers are genuinely welcome — we offer rehearsal sessions.
- Accepted speakers get travel support and a companion ticket.

Submissions are reviewed anonymously by the programme committee.`,
  },
};
