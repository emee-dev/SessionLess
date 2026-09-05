import { useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { format } from "date-fns";
import { ChevronDownIcon, CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TagsInput from "@/components/ui/tags-input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { slugify } from "@/lib/utils";

export const eventTypeOptions = [{ label: "Conference", value: "conference" }];

type BasicFormState = {
  eventName: string;
  slug: string;
  eventType: string;
  website: string;
  location: string;
  theme: string;
  startsAt: Date;
  endsAt: Date;
};

type UseEventFormOptions = {
  initialData: BasicFormState;
};

type UseDeadlineOptions = {
  initialDate: Date | undefined;
  startsAt: Date;
  endsAt: Date;
};

type EventDetailsFormProps = {
  formData: BasicFormState;
  slugExists: boolean | undefined;
  isEditingSlug: boolean;
  eventTypeOptions: {
    label: string;
    value: string;
  }[];
  startsAtOpen: boolean;
  endsAtOpen: boolean;
  tracks: string[];
  rooms: string[];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => void;
  onEventTypeChange: (value: string | null) => void;
  onStartsAtChange: (date: Date | undefined) => void;
  onEndsAtChange: (date: Date | undefined) => void;
  onStartsAtOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onEndsAtOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onSlugFocus: () => void;
  onSlugBlur: () => void;
  onTracksChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRoomsChange: React.Dispatch<React.SetStateAction<string[]>>;
};

export function useEvent(): EventQuery | null {
  return {
    userId: "",
    _id: "evt_01J7K8M2N3P4Q5R6S7T8U9V0W1" as Id<"events">,
    eventName: "TechConnect Africa 2026",
    slug: "techconnect-africa-2026",
    eventType: "Conference",
    website: "https://techconnectafrica.com",
    location: "Landmark Event Centre, Lagos, Nigeria",
    theme: "Modern",
    startsAt: "2026-11-12T09:00:00+01:00",
    endsAt: "2026-11-14T17:00:00+01:00",
    submissionDeadline: "2026-11-13T17:00:00+01:00",
    _creationTime: Date.now(),
    rooms: [],
    tracks: [],
    submissionsByRoom: [],
    submissionsByTrack: [],
    totalSpeakers: 0,
    totalSubmissions: 0,
  };
}

type EventQuery = FunctionReturnType<typeof api.events.getEventBySlug>;

export function useEventForm({ initialData }: UseEventFormOptions) {
  const [formData, setFormData] = React.useState<BasicFormState>(initialData);

  const [slugManuallyEdited, setSlugManuallyEdited] =
    React.useState<boolean>(false);

  const [startsAtOpen, setStartsAtOpen] = React.useState<boolean>(false);
  const [endsAtOpen, setEndsAtOpen] = React.useState<boolean>(false);

  const [isEditingSlug, setIsEditingSlug] = React.useState<boolean>(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = event.target;

    if (name === "slug") {
      setSlugManuallyEdited(true);

      setFormData((prev) => ({
        ...prev,
        slug: value,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "eventName" && !slugManuallyEdited
        ? { slug: slugify(value) }
        : {}),
    }));
  };

  const handleEventTypeChange = (value: string | null): void => {
    setFormData((prev) => ({
      ...prev,
      eventType: value ?? "",
    }));
  };

  const handleStartDateChange = (date: Date | undefined): void => {
    const startsAt: Date = date ?? new Date();

    setFormData((prev) => ({
      ...prev,
      startsAt,
      endsAt: prev.endsAt < startsAt ? startsAt : prev.endsAt,
    }));

    setStartsAtOpen(false);
  };

  const handleEndDateChange = (date: Date | undefined): void => {
    setFormData((prev) => ({
      ...prev,
      endsAt: date ?? new Date(),
    }));

    setEndsAtOpen(false);
  };

  return {
    formData,
    setFormData,

    slugManuallyEdited,

    startsAtOpen,
    setStartsAtOpen,

    endsAtOpen,
    setEndsAtOpen,

    isEditingSlug,
    setIsEditingSlug,

    handleChange,
    handleEventTypeChange,
    handleStartDateChange,
    handleEndDateChange,
  };
}

export function useDeadline({
  initialDate,
  startsAt,
  endsAt,
}: UseDeadlineOptions) {
  const [deadlineDate, setDeadlineDate] = React.useState<Date | undefined>(
    initialDate,
  );

  const [deadlineTime, setDeadlineTime] = React.useState<string>(() =>
    initialDate ? format(initialDate, "HH:mm") : "12:00",
  );

  const [open, setOpen] = React.useState<boolean>(false);

  const time = React.useMemo(() => {
    const [hours, minutes] = deadlineTime.split(":").map(Number);

    return {
      hours,
      minutes,
      hour12: hours % 12 || 12,
      period: hours >= 12 ? "PM" : "AM",
    };
  }, [deadlineTime]);

  React.useEffect(() => {
    if (!deadlineDate) {
      return;
    }

    if (deadlineDate < startsAt) {
      setDeadlineDate(startsAt);
    } else if (deadlineDate > endsAt) {
      setDeadlineDate(endsAt);
    }
  }, [deadlineDate, startsAt, endsAt]);

  const setTime = (
    hour12: number = time.hour12,
    minutes: number = time.minutes,
    period: "AM" | "PM" = time.period as any,
  ): void => {
    let hours24: number;

    if (period === "AM") {
      hours24 = hour12 === 12 ? 0 : hour12;
    } else {
      hours24 = hour12 === 12 ? 12 : hour12 + 12;
    }

    setDeadlineTime(
      `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    );
  };

  const getDateTime = (): Date | undefined => {
    if (!deadlineDate || !deadlineTime) {
      return undefined;
    }

    const [hours, minutes] = deadlineTime.split(":").map(Number);

    return new Date(
      deadlineDate.getFullYear(),
      deadlineDate.getMonth(),
      deadlineDate.getDate(),
      hours,
      minutes,
      0,
    );
  };

  return {
    deadlineDate,
    setDeadlineDate,

    deadlineTime,

    open,
    setOpen,

    ...time,

    setTime,
    getDateTime,
  };
}

export const EventDetailsForm = ({
  formData,
  slugExists,
  onChange: handleChange,
  onEndsAtChange,
  endsAtOpen,
  onSlugBlur,
  onSlugFocus,
  onStartsAtOpenChange,
  onStartsAtChange,
  onRoomsChange,
  rooms,
  tracks,
  onEventTypeChange,
  onEndsAtOpenChange,
  isEditingSlug,
  onTracksChange,
  startsAtOpen,
  eventTypeOptions,
}: EventDetailsFormProps) => {
  return (
    <section className="max-w-[760px]">
      <header className="mb-7">
        <h1 className="font-semibold tracking-tight">Event Details</h1>
        <p className="mt-1 text-muted-foreground">
          Configure basic event information
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <div className="grid gap-x-4 gap-y-6 md:grid-cols-2">
          <div className="gap-y-2 flex flex-col">
            <FieldLabel className="text-sm tracking-tight">
              Event Name
            </FieldLabel>
            <Input
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              placeholder="Abstract conference"
              className="rounded-lg"
            />
          </div>

          <div className="">
            <div className="gap-y-2 flex flex-col">
              <FieldLabel className="text-sm tracking-tight">
                Event Slug
              </FieldLabel>
              <div className="relative">
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="abstract-conf"
                  className={`rounded-lg ${
                    formData.slug
                      ? slugExists === true
                        ? "border-destructive pr-9 focus-visible:border-destructive"
                        : slugExists === false
                          ? "border-emerald-500 pr-9 focus-visible:border-emerald-500"
                          : "pr-9"
                      : undefined
                  }`}
                  onBlur={onSlugBlur}
                  onFocus={onSlugFocus}
                />

                {formData.slug && slugExists !== undefined && (
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    {slugExists ? (
                      <CircleX className="size-4 text-destructive" />
                    ) : (
                      <CircleCheck className="size-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditingSlug && formData.slug && (
              <p
                className={`mt-1.5 text-[11px] ${
                  slugExists === true
                    ? "text-destructive"
                    : slugExists === false
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                }`}
              >
                {slugExists === undefined
                  ? "Checking availability..."
                  : slugExists
                    ? "This slug is already taken."
                    : "This slug is available."}
              </p>
            )}
          </div>
          <div className="gap-y-2 flex flex-col">
            <FieldLabel className="text-sm tracking-tight">
              Event Type
            </FieldLabel>
            <div className="relative">
              <Select
                items={eventTypeOptions}
                value={formData.eventType}
                onValueChange={(value: string | null) =>
                  onEventTypeChange(value)
                }
              >
                <SelectTrigger className={`w-full rounded-lg`}>
                  <SelectValue placeholder="What type of event is this?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Event type</SelectLabel>
                    {eventTypeOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="gap-y-2 flex flex-col">
            <FieldLabel className="text-sm tracking-tight">
              Event Website URL
            </FieldLabel>
            <Input
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Your website"
              className="rounded-lg"
            />
          </div>
          <div className="gap-y-2 flex flex-col">
            <FieldLabel className="text-sm tracking-tight">
              Event Location
            </FieldLabel>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. San Francisco, CA"
              className="rounded-lg"
            />
          </div>
        </div>
        <div className="grid gap-x-4 gap-y-6 md:grid-cols-2">
          <FieldGroup className="max-w-xs flex-row">
            <Field>
              <FieldLabel
                htmlFor="starts_at"
                className="text-sm tracking-tight"
              >
                Starts At
              </FieldLabel>
              <Popover open={startsAtOpen} onOpenChange={onStartsAtOpenChange}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      id="starts_at"
                      className="w-32 justify-between font-normal rounded-lg"
                    >
                      {formData.startsAt
                        ? format(formData.startsAt, "PPP")
                        : "Select date"}
                      <ChevronDownIcon data-icon="inline-end" />
                    </Button>
                  }
                />
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={formData.startsAt}
                    captionLayout="dropdown"
                    defaultMonth={formData.startsAt}
                    onSelect={(date) => {
                      const newStart = date ?? new Date();
                      onStartsAtChange(newStart);
                      onEndsAtChange(
                        formData.endsAt < newStart ? newStart : formData.endsAt,
                      );
                      onStartsAtOpenChange(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>

          <FieldGroup className="max-w-xs flex-row">
            <Field>
              <FieldLabel
                htmlFor="date-picker-optional"
                className="text-sm tracking-tight"
              >
                Ends At
              </FieldLabel>
              <Popover open={endsAtOpen} onOpenChange={onEndsAtOpenChange}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      id="date-picker-optional"
                      className="w-32 justify-between font-normal rounded-lg"
                    >
                      {formData.endsAt
                        ? format(formData.endsAt, "PPP")
                        : "Select date"}
                      <ChevronDownIcon data-icon="inline-end" />
                    </Button>
                  }
                />
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={formData.endsAt}
                    captionLayout="dropdown"
                    defaultMonth={formData.endsAt}
                    // Only allow picking dates on/after startsAt.
                    disabled={(date: Date) => date < formData.startsAt}
                    onSelect={(date) => {
                      onEndsAtChange(date ?? new Date());
                      onEndsAtOpenChange(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>
        </div>

        <div className="grid gap-x-4 gap-y-6 md:grid-cols-2">
          <div className="gap-y-2 flex flex-col">
            <FieldLabel className="text-sm tracking-tight">
              Event Tracks
            </FieldLabel>
            <TagsInput
              tags={tracks}
              onTagsChange={onTracksChange}
              placeholder="e.g. Engineering, Design, Product"
              className="rounded-lg"
            />
          </div>

          <div className="gap-y-2 flex flex-col">
            <FieldLabel className="text-sm tracking-tight">
              Event Rooms
            </FieldLabel>
            <TagsInput
              tags={rooms}
              onTagsChange={onRoomsChange}
              placeholder="e.g. Main Hall, Room A, Auditorium"
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="gap-y-2 flex flex-col">
          <FieldLabel className="text-sm tracking-tight">Theme</FieldLabel>

          <Textarea
            name="theme"
            maxLength={1000}
            className="min-h-[88px] w-full resize-y rounded-lg border border-input bg-background p-2 text-sm leading-5 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={formData.theme}
            onChange={handleChange}
            placeholder="This helps improve search, recommendations, and how content is organized."
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {formData.theme.length} / 1000
          </p>
        </div>

        <div className="flex border-t border-border pt-4"></div>
      </div>
    </section>
  );
};

type DeadlineFormProps = ReturnType<typeof useDeadline> & {
  startsAt: Date;
  endsAt: Date;
};

export const DeadlineForm = ({
  deadlineDate,
  endsAt,
  hour12,
  minutes,
  open,
  period,
  setDeadlineDate,
  setOpen,
  setTime,
  startsAt,
}: DeadlineFormProps) => {
  return (
    <section className="mt-4 max-w-[760px]">
      <div className="mb-7">
        <h1 className="font-semibold tracking-tight"> Deadlines</h1>

        <p className="mt-1 text-muted-foreground">
          When the form stops accepting new and updated submissions
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid gap-x-4 gap-y-6 md:grid-cols-2">
          <FieldGroup className="max-w-xs flex-row">
            <Field>
              <FieldLabel
                htmlFor="date-picker-optional"
                className="text-sm tracking-tight"
              >
                Close date
              </FieldLabel>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      id="date-picker-optional"
                      className="w-32 justify-between font-normal rounded-lg"
                    >
                      {deadlineDate
                        ? format(deadlineDate, "PPP")
                        : "Select date"}

                      <ChevronDownIcon data-icon="inline-end" />
                    </Button>
                  }
                />

                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={deadlineDate}
                    captionLayout="dropdown"
                    defaultMonth={deadlineDate}
                    // Deadline must fall within [startsAt, endsAt].
                    disabled={(candidate: Date) =>
                      candidate < startsAt || candidate > endsAt
                    }
                    onSelect={(selectedDate: Date | undefined) => {
                      setDeadlineDate(selectedDate);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            {/* Time */}
            <Field className="w-[220px]">
              <FieldLabel
                htmlFor="time-picker-optional"
                className="text-sm tracking-tight"
              >
                Time
              </FieldLabel>

              <div id="time-picker-optional" className="flex gap-1">
                {/* Hour */}
                <Select
                  value={String(hour12)}
                  onValueChange={(value: string | null) => {
                    if (!value) {
                      return;
                    }

                    setTime(Number(value), minutes, period as "AM" | "PM");
                  }}
                >
                  <SelectTrigger className="w-fit rounded-lg">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>

                  <SelectContent>
                    {Array.from({ length: 12 }, (_, index: number) => {
                      const hour: number = index + 1;

                      return (
                        <SelectItem key={hour} value={String(hour)}>
                          {String(hour).padStart(2, "0")}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Minute */}
                <Select
                  value={String(minutes)}
                  onValueChange={(value: string | null) => {
                    if (!value) {
                      return;
                    }

                    setTime(hour12, Number(value), period as "PM" | "AM");
                  }}
                >
                  <SelectTrigger className=" w-fit rounded-lg">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>

                  <SelectContent>
                    {Array.from({ length: 60 }, (_, minute: number) => (
                      <SelectItem key={minute} value={String(minute)}>
                        {String(minute).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={period}
                  onValueChange={(value: string | null) => {
                    if (value !== "AM" && value !== "PM") {
                      return;
                    }

                    setTime(hour12, minutes, value);
                  }}
                >
                  <SelectTrigger className="w-fit rounded-lg">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Field>
          </FieldGroup>
        </div>
      </div>
    </section>
  );
};

export function UpdateEventPage() {
  const updateEvent = useMutation(api.events.updateEvent);

  const event = useEvent();
  const [rooms, setRooms] = React.useState<string[]>([]);
  const [tracks, setTracks] = React.useState<string[]>([]);

  const eventForm = useEventForm({
    initialData: {
      eventName: event?.eventName ?? "",
      slug: event?.slug ?? "",
      eventType: event?.eventType ?? "",
      website: event?.website ?? "",
      location: event?.location ?? "",
      theme: event?.theme ?? "",
      startsAt: new Date(event?.startsAt!),
      endsAt: new Date(event?.endsAt!),
    },
  });

  const deadline = useDeadline({
    initialDate: new Date(),
    startsAt: eventForm.formData.startsAt,
    endsAt: eventForm.formData.endsAt,
  });

  const slugExists: boolean | undefined = useQuery(
    api.events.isExistingSlug,
    eventForm.formData.slug ? { slug: eventForm.formData.slug } : "skip",
  );

  const handleSubmit = async (
    ev: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    ev.preventDefault();

    const submissionDeadline = deadline.getDateTime();

    if (!event || !submissionDeadline) {
      return;
    }

    await updateEvent({
      _id: event._id,
      eventName: eventForm.formData.eventName,
      location: eventForm.formData.location,
      eventType: eventForm.formData.eventType,
      slug: eventForm.formData.slug,
      theme: eventForm.formData.theme,
      website: eventForm.formData.website,
      startsAt: eventForm.formData.startsAt.toISOString(),
      endsAt: eventForm.formData.endsAt.toISOString(),
      submissionDeadline: submissionDeadline.toISOString(),
    });
  };

  return (
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
          Update
        </Button>
      </div>
    </form>
  );
}

export function EventSettingsEmptyUI() {
  return (
    <div className="flex items-center justify-center pt-10">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No events yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any events yet. Get started by creating
            your first event.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button
              render={<Link href="/~/create_event" />}
              nativeButton={false}
            >
              Create event
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
