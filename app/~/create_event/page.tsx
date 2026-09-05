"use client";

import { useMutation, useQuery } from "convex/react";
import { FunctionArgs } from "convex/server";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  DeadlineForm,
  EventDetailsForm,
  eventTypeOptions,
  useDeadline,
  useEventForm,
} from "@/components/event";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

type CreateEvent = FunctionArgs<typeof api.events.createEvent>;

export default function CreateEventPage(props: PageProps<"/~/create_event">) {
  const router = useRouter();
  const createEvent = useMutation(api.events.createEvent);
  const [rooms, setRooms] = React.useState<string[]>([]);
  const [tracks, setTracks] = React.useState<string[]>([]);

  const eventForm = useEventForm({
    initialData: {
      eventName: "",
      slug: "",
      eventType: "",
      website: "",
      location: "",
      theme: "",
      startsAt: new Date(),
      endsAt: new Date(),
    },
  });

  const deadline = useDeadline({
    initialDate: new Date(),
    startsAt: eventForm.formData.startsAt,
    endsAt: eventForm.formData.endsAt,
  });

  const slugExists = useQuery(
    api.events.isExistingSlug,
    eventForm.formData.slug ? { slug: eventForm.formData.slug } : "skip",
  );

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const submissionDeadline = deadline.getDateTime();

    if (!submissionDeadline) {
      return;
    }

    const payload: CreateEvent = {
      userId: "",
      eventName: eventForm.formData.eventName,
      location: eventForm.formData.location,
      eventType: eventForm.formData.eventType,
      slug: eventForm.formData.slug,
      tracks,
      rooms,
      theme: eventForm.formData.theme,
      website: eventForm.formData.website,
      submissionDeadline: submissionDeadline.toISOString(),
      startsAt: eventForm.formData.startsAt.toISOString(),
      endsAt: eventForm.formData.endsAt.toISOString(),
    };

    await createEvent(payload);
    router.push(`/~/${payload.slug}`);
  };

  return (
    <main className="min-h-screen border-t border-border bg-muted/35 px-6 py-6 text-foreground sm:px-8 sm:py-7">
      <form onSubmit={handleSubmit}>
        <EventDetailsForm
          formData={eventForm.formData}
          slugExists={slugExists}
          isEditingSlug={eventForm.isEditingSlug}
          eventTypeOptions={eventTypeOptions}
          startsAtOpen={eventForm.startsAtOpen}
          endsAtOpen={eventForm.endsAtOpen}
          tracks={tracks}
          rooms={rooms}
          onChange={eventForm.handleChange}
          onEventTypeChange={eventForm.handleEventTypeChange}
          onStartsAtChange={eventForm.handleStartDateChange}
          onEndsAtChange={eventForm.handleEndDateChange}
          onStartsAtOpenChange={eventForm.setStartsAtOpen}
          onEndsAtOpenChange={eventForm.setEndsAtOpen}
          onSlugFocus={() => eventForm.setIsEditingSlug(true)}
          onSlugBlur={() => eventForm.setIsEditingSlug(false)}
          onTracksChange={setTracks}
          onRoomsChange={setRooms}
        />

        <DeadlineForm
          startsAt={eventForm.formData.startsAt}
          endsAt={eventForm.formData.endsAt}
          {...deadline}
        />

        <div className="mt-4 flex max-w-[760px] border-t border-border pt-4">
          <Button type="submit" className="ml-auto px-4 py-2">
            Save
          </Button>
        </div>
      </form>
    </main>
  );
}

function PageHandler() {
  const router = useRouter();
  const createEvent = useMutation(api.events.createEvent);
  const [rooms, setRooms] = React.useState<string[]>([]);
  const [tracks, setTracks] = React.useState<string[]>([]);

  const eventForm = useEventForm({
    initialData: {
      eventName: "",
      slug: "",
      eventType: "",
      website: "",
      location: "",
      theme: "",
      startsAt: new Date(),
      endsAt: new Date(),
    },
  });

  const deadline = useDeadline({
    initialDate: new Date(),
    startsAt: eventForm.formData.startsAt,
    endsAt: eventForm.formData.endsAt,
  });

  const slugExists = useQuery(
    api.events.isExistingSlug,
    eventForm.formData.slug ? { slug: eventForm.formData.slug } : "skip",
  );

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const submissionDeadline = deadline.getDateTime();

    if (!submissionDeadline) {
      return;
    }

    const payload: CreateEvent = {
      userId: "",
      eventName: eventForm.formData.eventName,
      location: eventForm.formData.location,
      eventType: eventForm.formData.eventType,
      slug: eventForm.formData.slug,
      tracks,
      rooms,
      theme: eventForm.formData.theme,
      website: eventForm.formData.website,
      submissionDeadline: submissionDeadline.toISOString(),
      startsAt: eventForm.formData.startsAt.toISOString(),
      endsAt: eventForm.formData.endsAt.toISOString(),
    };

    await createEvent(payload);
    router.push(`/~/${payload.slug}`);
  };

  return (
    <main className="min-h-screen border-t border-border bg-muted/35 px-6 py-6 text-foreground sm:px-8 sm:py-7">
      <form onSubmit={handleSubmit}>
        <EventDetailsForm
          formData={eventForm.formData}
          slugExists={slugExists}
          isEditingSlug={eventForm.isEditingSlug}
          eventTypeOptions={eventTypeOptions}
          startsAtOpen={eventForm.startsAtOpen}
          endsAtOpen={eventForm.endsAtOpen}
          tracks={tracks}
          rooms={rooms}
          onChange={eventForm.handleChange}
          onEventTypeChange={eventForm.handleEventTypeChange}
          onStartsAtChange={eventForm.handleStartDateChange}
          onEndsAtChange={eventForm.handleEndDateChange}
          onStartsAtOpenChange={eventForm.setStartsAtOpen}
          onEndsAtOpenChange={eventForm.setEndsAtOpen}
          onSlugFocus={() => eventForm.setIsEditingSlug(true)}
          onSlugBlur={() => eventForm.setIsEditingSlug(false)}
          onTracksChange={setTracks}
          onRoomsChange={setRooms}
        />

        <DeadlineForm
          startsAt={eventForm.formData.startsAt}
          endsAt={eventForm.formData.endsAt}
          {...deadline}
        />

        <div className="mt-4 flex max-w-[760px] border-t border-border pt-4">
          <Button type="submit" className="ml-auto px-4 py-2">
            Save
          </Button>
        </div>
      </form>
    </main>
  );
}
