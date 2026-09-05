"use client";

import { usePaginatedQuery } from "convex/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AttachmentsPage } from "@/components/attachments";
import { Charts } from "@/components/charts";
import { PaginatedDataTable } from "@/components/data-table";
import { UpdateEventPage } from "@/components/event";
import {
  AbstractSubmissions,
  abstractSubmissionColumns,
} from "@/components/organizer-tables/abstractSubmissionColumns";
import {
  Events,
  eventsColumns,
} from "@/components/organizer-tables/eventsColumn";
import { TasksPage } from "@/components/tasks";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { events, layouts } from "@/lib/constant";

const mockEvents: Events[] = [
  {
    _id: "event_001" as Id<"events">,
    _creationTime: 1735084800000,
    userId: "user_001",
    eventName: "Tech Summit 2026",
    slug: "tech-summit-2026",
    eventType: "Conference",
    website: "https://techsummit.example.com",
    location: "Lagos, Nigeria",
    tracks: [
      "AI & Machine Learning",
      "Web3 & Blockchain",
      "Cloud & DevOps",
      "Cybersecurity",
    ],
    rooms: ["Main Hall", "Room A", "Room B", "Room C"],
    theme: "Technology & Innovation",
    startsAt: "2026-10-15T09:00:00.000Z",
    endsAt: "2026-10-17T17:00:00.000Z",
    submissionDeadline: "2026-09-15T23:59:59.000Z",
    totalSubmissions: 184,
    totalSpeakers: 42,
    submissionsByTrack: [
      { track: "AI & Machine Learning", submissions: 62 },
      { track: "Web3 & Blockchain", submissions: 38 },
      { track: "Cloud & DevOps", submissions: 51 },
      { track: "Cybersecurity", submissions: 33 },
    ],
    submissionsByRoom: [
      { room: "Main Hall", submissions: 55 },
      { room: "Room A", submissions: 47 },
      { room: "Room B", submissions: 44 },
      { room: "Room C", submissions: 38 },
    ],
  },
  {
    _id: "event_002" as Id<"events">,
    _creationTime: 1735171200000,
    userId: "user_002",
    eventName: "African Startup Week",
    slug: "african-startup-week",
    eventType: "Summit",
    website: "https://africanstartupweek.example.com",
    location: "Accra, Ghana",
    tracks: [
      "Fundraising",
      "Product-Market Fit",
      "Growth & Marketing",
      "Founder Stories",
    ],
    rooms: ["Main Stage", "Pitch Room", "Workshop Room"],
    theme: "Startups & Entrepreneurship",
    startsAt: "2026-11-03T08:30:00.000Z",
    endsAt: "2026-11-06T18:00:00.000Z",
    submissionDeadline: "2026-10-01T23:59:59.000Z",
    totalSubmissions: 227,
    totalSpeakers: 58,
    submissionsByTrack: [
      { track: "Fundraising", submissions: 71 },
      { track: "Product-Market Fit", submissions: 54 },
      { track: "Growth & Marketing", submissions: 63 },
      { track: "Founder Stories", submissions: 39 },
    ],
    submissionsByRoom: [
      { room: "Main Stage", submissions: 98 },
      { room: "Pitch Room", submissions: 76 },
      { room: "Workshop Room", submissions: 53 },
    ],
  },
  {
    _id: "event_003" as Id<"events">,
    _creationTime: 1735257600000,
    userId: "user_003",
    eventName: "Product Design Conference",
    slug: "product-design-conference-2026",
    eventType: "Conference",
    website: "https://productdesignconf.example.com",
    location: "London, United Kingdom",
    tracks: ["UX Research", "Design Systems", "Product Strategy"],
    rooms: ["Auditorium", "Studio 1", "Studio 2"],
    theme: "Product & Design",
    startsAt: "2026-09-22T09:00:00.000Z",
    endsAt: "2026-09-23T17:00:00.000Z",
    submissionDeadline: "2026-08-31T23:59:59.000Z",
    totalSubmissions: 143,
    totalSpeakers: 31,
    submissionsByTrack: [
      { track: "UX Research", submissions: 52 },
      { track: "Design Systems", submissions: 48 },
      { track: "Product Strategy", submissions: 43 },
    ],
    submissionsByRoom: [
      { room: "Auditorium", submissions: 61 },
      { room: "Studio 1", submissions: 44 },
      { room: "Studio 2", submissions: 38 },
    ],
  },
  {
    _id: "event_004" as Id<"events">,
    _creationTime: 1735344000000,
    userId: "user_004",
    eventName: "DevFest Port Harcourt",
    slug: "devfest-port-harcourt-2026",
    eventType: "Developer Conference",
    website: "https://devfestph.example.com",
    location: "Port Harcourt, Nigeria",
    tracks: [
      "Mobile Development",
      "Web Development",
      "Cloud Native",
      "Data Engineering",
    ],
    rooms: ["Hall 1", "Hall 2", "Breakout Room"],
    theme: "Software Development",
    startsAt: "2026-10-24T09:00:00.000Z",
    endsAt: "2026-10-25T17:00:00.000Z",
    submissionDeadline: "2026-09-30T23:59:59.000Z",
    totalSubmissions: 168,
    totalSpeakers: 36,
    submissionsByTrack: [
      { track: "Mobile Development", submissions: 41 },
      { track: "Web Development", submissions: 55 },
      { track: "Cloud Native", submissions: 39 },
      { track: "Data Engineering", submissions: 33 },
    ],
    submissionsByRoom: [
      { room: "Hall 1", submissions: 72 },
      { room: "Hall 2", submissions: 61 },
      { room: "Breakout Room", submissions: 35 },
    ],
  },
  {
    _id: "event_005" as Id<"events">,
    _creationTime: 1735430400000,
    userId: "user_005",
    eventName: "Future of AI Summit",
    slug: "future-of-ai-summit",
    eventType: "Summit",
    website: "https://futureofai.example.com",
    location: "San Francisco, USA",
    tracks: ["Generative AI", "AI Safety", "AI in Enterprise", "Robotics"],
    rooms: ["Grand Ballroom", "Innovation Lab", "Panel Room"],
    theme: "Artificial Intelligence",
    startsAt: "2026-12-01T09:00:00.000Z",
    endsAt: "2026-12-03T18:00:00.000Z",
    submissionDeadline: "2026-10-31T23:59:59.000Z",
    totalSubmissions: 312,
    totalSpeakers: 67,
    submissionsByTrack: [
      { track: "Generative AI", submissions: 118 },
      { track: "AI Safety", submissions: 64 },
      { track: "AI in Enterprise", submissions: 79 },
      { track: "Robotics", submissions: 51 },
    ],
    submissionsByRoom: [
      { room: "Grand Ballroom", submissions: 142 },
      { room: "Innovation Lab", submissions: 98 },
      { room: "Panel Room", submissions: 72 },
    ],
  },
  {
    _id: "event_006" as Id<"events">,
    _creationTime: 1735516800000,
    userId: "user_006",
    eventName: "Creative Africa Forum",
    slug: "creative-africa-forum",
    eventType: "Forum",
    website: "https://creativeafrica.example.com",
    location: "Nairobi, Kenya",
    tracks: [
      "Film & Media",
      "Music Industry",
      "Visual Arts",
      "Creative Business",
    ],
    rooms: ["Main Theatre", "Gallery Room", "Studio Space"],
    theme: "Arts & Creative Economy",
    startsAt: "2026-11-18T10:00:00.000Z",
    endsAt: "2026-11-20T17:00:00.000Z",
    submissionDeadline: "2026-10-20T23:59:59.000Z",
    totalSubmissions: 156,
    totalSpeakers: 34,
    submissionsByTrack: [
      { track: "Film & Media", submissions: 48 },
      { track: "Music Industry", submissions: 41 },
      { track: "Visual Arts", submissions: 36 },
      { track: "Creative Business", submissions: 31 },
    ],
    submissionsByRoom: [
      { room: "Main Theatre", submissions: 68 },
      { room: "Gallery Room", submissions: 51 },
      { room: "Studio Space", submissions: 37 },
    ],
  },
  {
    _id: "event_007" as Id<"events">,
    _creationTime: 1735603200000,
    userId: "user_007",
    eventName: "Fintech Leaders Africa",
    slug: "fintech-leaders-africa-2026",
    eventType: "Conference",
    website: "https://fintechleaders.example.com",
    location: "Abuja, Nigeria",
    tracks: [
      "Digital Payments",
      "Regulatory Tech",
      "Financial Inclusion",
      "Investment & VC",
    ],
    rooms: ["Executive Hall", "Room 101", "Room 102"],
    theme: "Fintech & Financial Services",
    startsAt: "2026-10-08T09:00:00.000Z",
    endsAt: "2026-10-09T17:30:00.000Z",
    submissionDeadline: "2026-09-05T23:59:59.000Z",
    totalSubmissions: 201,
    totalSpeakers: 45,
    submissionsByTrack: [
      { track: "Digital Payments", submissions: 68 },
      { track: "Regulatory Tech", submissions: 39 },
      { track: "Financial Inclusion", submissions: 54 },
      { track: "Investment & VC", submissions: 40 },
    ],
    submissionsByRoom: [
      { room: "Executive Hall", submissions: 89 },
      { room: "Room 101", submissions: 63 },
      { room: "Room 102", submissions: 49 },
    ],
  },
  {
    _id: "event_008" as Id<"events">,
    _creationTime: 1735689600000,
    userId: "user_008",
    eventName: "Climate Innovation Forum",
    slug: "climate-innovation-forum",
    eventType: "Forum",
    website: "https://climateinnovation.example.com",
    location: "Cape Town, South Africa",
    tracks: [
      "Renewable Energy",
      "Climate Adaptation",
      "Green Finance",
      "Circular Economy",
    ],
    rooms: ["Plenary Hall", "Room East", "Room West"],
    theme: "Climate & Sustainability",
    startsAt: "2026-11-10T09:00:00.000Z",
    endsAt: "2026-11-12T16:00:00.000Z",
    submissionDeadline: "2026-10-10T23:59:59.000Z",
    totalSubmissions: 178,
    totalSpeakers: 39,
    submissionsByTrack: [
      { track: "Renewable Energy", submissions: 57 },
      { track: "Climate Adaptation", submissions: 44 },
      { track: "Green Finance", submissions: 41 },
      { track: "Circular Economy", submissions: 36 },
    ],
    submissionsByRoom: [
      { room: "Plenary Hall", submissions: 74 },
      { room: "Room East", submissions: 56 },
      { room: "Room West", submissions: 48 },
    ],
  },
  {
    _id: "event_009" as Id<"events">,
    _creationTime: 1735776000000,
    userId: "user_009",
    eventName: "Open Source Africa",
    slug: "open-source-africa-2026",
    eventType: "Conference",
    website: "https://opensourceafrica.example.com",
    location: "Kigali, Rwanda",
    tracks: [
      "Open Source Governance",
      "Infrastructure & Tooling",
      "Community Building",
    ],
    rooms: ["Main Hall", "Hacker Room", "Community Space"],
    theme: "Open Source & Technology",
    startsAt: "2026-09-29T09:00:00.000Z",
    endsAt: "2026-10-01T17:00:00.000Z",
    submissionDeadline: "2026-09-01T23:59:59.000Z",
    totalSubmissions: 132,
    totalSpeakers: 29,
    submissionsByTrack: [
      { track: "Open Source Governance", submissions: 38 },
      { track: "Infrastructure & Tooling", submissions: 51 },
      { track: "Community Building", submissions: 43 },
    ],
    submissionsByRoom: [
      { room: "Main Hall", submissions: 55 },
      { room: "Hacker Room", submissions: 46 },
      { room: "Community Space", submissions: 31 },
    ],
  },
  {
    _id: "event_010" as Id<"events">,
    _creationTime: 1735862400000,
    userId: "user_010",
    eventName: "Global Marketing Summit",
    slug: "global-marketing-summit-2026",
    eventType: "Summit",
    website: "https://globalmarketingsummit.example.com",
    location: "Dubai, UAE",
    tracks: [
      "Brand Strategy",
      "Digital Advertising",
      "Content Marketing",
      "Marketing Analytics",
    ],
    rooms: ["Grand Hall", "Suite A", "Suite B"],
    theme: "Marketing & Growth",
    startsAt: "2026-12-08T09:00:00.000Z",
    endsAt: "2026-12-10T18:00:00.000Z",
    submissionDeadline: "2026-11-01T23:59:59.000Z",
    totalSubmissions: 195,
    totalSpeakers: 43,
    submissionsByTrack: [
      { track: "Brand Strategy", submissions: 49 },
      { track: "Digital Advertising", submissions: 58 },
      { track: "Content Marketing", submissions: 47 },
      { track: "Marketing Analytics", submissions: 41 },
    ],
    submissionsByRoom: [
      { room: "Grand Hall", submissions: 87 },
      { room: "Suite A", submissions: 61 },
      { room: "Suite B", submissions: 47 },
    ],
  },
];

export const mockSubmissions: AbstractSubmissions[] = [
  {
    _id: "submission_001" as AbstractSubmissions["_id"],
    _creationTime: 1756800000000,
    eventsId: "event_001" as AbstractSubmissions["eventsId"],
    speakerId: "speaker_001" as AbstractSubmissions["speakerId"],
    title: "Building Scalable Event-Driven Systems with TypeScript",
    room: "Auditorium",
    track: "Typescript",
    abstractData: {
      abstract:
        "A practical look at designing reliable event-driven systems with TypeScript.",
      track: "Engineering",
      format: "Talk",
      duration: 30,
    },
    participantData: {
      firstName: "Emmanuel",
      lastName: "Ajike",
      email: "emmanuel@example.com",
      organization: "Acme Technologies",
      jobTitle: "Software Engineer",
    },
    evaluation: "Pending",
    editVersion: 0,
  },

  {
    _id: "submission_002" as AbstractSubmissions["_id"],
    _creationTime: 1756800100000,
    eventsId: "event_001" as AbstractSubmissions["eventsId"],
    speakerId: "speaker_002" as AbstractSubmissions["speakerId"],
    title: "The Future of AI-Assisted Software Development",
    room: "Auditorium",
    track: "AI",
    abstractData: {
      abstract:
        "Exploring how AI-assisted development is changing the way modern teams build software.",
      track: "AI & Machine Learning",
      format: "Talk",
      duration: 45,
    },
    participantData: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      organization: "Nova Labs",
      jobTitle: "Engineering Manager",
    },
    evaluation: "Accepted",
    editVersion: 0,
  },

  {
    _id: "submission_003" as AbstractSubmissions["_id"],
    _creationTime: 1756800200000,
    eventsId: "event_001" as AbstractSubmissions["eventsId"],
    speakerId: "speaker_003" as AbstractSubmissions["speakerId"],
    title: "Designing APIs That Developers Actually Enjoy Using",
    room: "Auditorium",
    track: "APIs",
    abstractData: {
      abstract:
        "A deep dive into API design principles, documentation, versioning, and developer experience.",
      track: "Backend",
      format: "Workshop",
      duration: 60,
    },
    participantData: {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael@example.com",
      organization: "CloudWorks",
      jobTitle: "Staff Engineer",
    },
    evaluation: "Accepted",
    editVersion: 0,
  },

  {
    _id: "submission_004" as AbstractSubmissions["_id"],
    _creationTime: 1756800300000,
    eventsId: "event_001" as AbstractSubmissions["eventsId"],
    speakerId: "speaker_004" as AbstractSubmissions["speakerId"],
    title: "From Monolith to Microservices: Lessons Learned",
    room: "Auditorium",
    track: "Microservices",
    abstractData: {
      abstract:
        "Real-world lessons from migrating a large production application from a monolith to microservices.",
      track: "Architecture",
      format: "Talk",
      duration: 40,
    },
    participantData: {
      firstName: "David",
      lastName: "Williams",
      email: "david@example.com",
      organization: "TechCorp",
      jobTitle: "Principal Engineer",
    },
    evaluation: "Rejected",
    editVersion: 0,
  },

  {
    _id: "submission_005" as AbstractSubmissions["_id"],
    _creationTime: 1756800400000,
    eventsId: "event_001" as AbstractSubmissions["eventsId"],
    speakerId: "speaker_005" as AbstractSubmissions["speakerId"],
    title: "Building Better Developer Experiences",
    room: "Hall 4",
    track: "Developer Experience",
    abstractData: {
      abstract:
        "How tooling, documentation, and internal platforms can dramatically improve developer productivity.",
      track: "Developer Experience",
      format: "Lightning Talk",
      duration: 20,
    },
    participantData: {
      firstName: "Jessica",
      lastName: "Brown",
      email: "jessica@example.com",
      organization: "BuildStack",
      jobTitle: "Developer Advocate",
    },
    evaluation: "Pending",
    editVersion: 0,
  },
];

const EVENT_PAGES: Record<string, React.ReactNode> = {
  // Event configuration
  [events.Welcome]: <WelcomePage />,
  [events.Abstract]: <AbstractPage />,
  [events.Participant]: <ParticipantPage />,
  [events.Confirmation]: <ConfirmationPage />,
  [events.Settings]: <UpdateEventPage />,

  // Organizer
  [events.Attachments]: <AttachmentsPage />,
  [events.Tasks]: <TasksPage />,
  [events.Calendar]: <CalendarPage />,
};

export default function Page() {
  return (
    <main className="min-h-screen border-t border-border px-4 py-6 text-foreground sm:px-6 sm:py-7">
      <Suspense fallback={<>Loading page</>}>
        <PageHandler />
      </Suspense>
    </main>
  );
}

function resolveEventPage(
  slug: string | null,
  page: string | null,
): React.ReactNode {
  if (!slug) {
    return <div>Unknown page</div>;
  }

  // `/events?slug=my-event`
  if (!page) {
    return (
      <div>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Charts />

              <main className="px-10x py-6 text-foreground sm:px-6 sm:py-7">
                <PaginatedDataTable
                  columns={abstractSubmissionColumns}
                  data={mockSubmissions}
                  // status={status}
                  // loadMore={loadMore}
                />
              </main>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // `/events?slug=my-event&page=abstract`
  return EVENT_PAGES[page] ?? <div>Unknown page</div>;
}

function PageHandler() {
  const query = useSearchParams();
  const slug = query.get(layouts.Slug);
  const page = query.get(layouts.Page);

  const isHome = slug === null && page === null;

  if (!isHome) return resolveEventPage(slug, page);

  return <EventsHome />;
}

function EventsHome() {
  const { loadMore, status } = usePaginatedQuery(
    api.events.listEvents,
    "skip",
    {
      initialNumItems: 5,
    },
  );

  return (
    <>
      <section>
        <header className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-semibold tracking-[-0.01em]">Events</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your events here
            </p>
          </div>
        </header>
      </section>

      <PaginatedDataTable
        columns={eventsColumns}
        data={mockEvents}
        loadMore={loadMore}
        status={status}
      />
    </>
  );
}

function WelcomePage() {
  return (
    <section>
      <header>
        <h1 className="font-semibold tracking-[-0.01em]">Welcome</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up the welcome experience for your event.
        </p>
      </header>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Configure what speakers see when they first access your event.
        </p>
      </div>
    </section>
  );
}

function AbstractPage() {
  return (
    <section>
      <header>
        <h1 className="font-semibold tracking-[-0.01em]">Abstract</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure abstract and submission requirements.
        </p>
      </header>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Manage the abstract submission form and its requirements.
        </p>
      </div>
    </section>
  );
}

function ParticipantPage() {
  return (
    <section>
      <header>
        <h1 className="font-semibold tracking-[-0.01em]">Participant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure participant information and requirements.
        </p>
      </header>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Manage the information participants need to provide.
        </p>
      </div>
    </section>
  );
}

function ConfirmationPage() {
  return (
    <section>
      <header>
        <h1 className="font-semibold tracking-[-0.01em]">Confirmation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the confirmation experience after submission.
        </p>
      </header>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Customize the message and information shown after a submission.
        </p>
      </div>
    </section>
  );
}

function CalendarPage() {
  return (
    <section>
      <header>
        <h1 className="font-semibold tracking-[-0.01em]">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your event schedule and calendar.
        </p>
      </header>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          View and manage the schedule for this event.
        </p>
      </div>
    </section>
  );
}
