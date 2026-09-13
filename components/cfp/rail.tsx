import { Layers01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarDays, Hourglass, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { daysUntil, formatDate, formatDateRange } from "@/lib/cfp";
import { cn } from "@/lib/utils";
import { EventDoc } from "./confirmation";

export function Rail({
  event,
  className,
  hideRail,
}: {
  event: EventDoc;
  className?: string;
  hideRail?: () => void;
}) {
  const remaining = daysUntil(event.submissionDeadline, new Date("2025-08-10"));
  const [firstWord, ...restWords] = event.eventName.split(" ");

  return (
    <aside
      className={cn(
        "relative border-b border-sand bg-linear-to-br from-cream to-sand/60 p-7 sm:p-9 lg:border-r lg:border-b-0",
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
        <span className="size-1.5 rounded-full bg-brand" />
        Call for Proposals
      </div>

      <h1 className="mt-5 font-heading text-4xl leading-[1.02] font-semibold tracking-tight sm:text-5xl">
        {firstWord}
        {restWords.length > 0 && (
          <span className="text-brand italic"> {restWords.join(" ")}</span>
        )}
      </h1>
      {event.theme && (
        <p className="mt-3 font-display text-lg text-brand-deep/80 italic">
          {event.theme}
        </p>
      )}

      <dl className="mt-7 space-y-4 text-sm">
        <RailRow
          icon={CalendarDays}
          title={`Event dates · ${formatDateRange(event.startsAt, event.endsAt)}`}
          detail={event.eventType}
        />
        <RailRow icon={MapPin} title={event.location} />
        <SubmissionDeadline submissionDeadline={event.submissionDeadline} />
      </dl>

      <div className="mt-7">
        <div className="mb-2.5 text-xs tracking-[0.2em] text-ink/50 uppercase">
          ROOMS
        </div>

        <div className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
          {event.rooms.map((room, index) => (
            <span key={room} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-ink/30" aria-hidden="true">
                  •
                </span>
              )}
              {room}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-2.5 text-xs tracking-[0.2em] text-ink/50 uppercase">
          Tracks
        </div>
        <div className="flex flex-col gap-2">
          {event.tracks.map((track) => (
            <span
              key={track}
              className="flex items-center gap-2 rounded-sm border border-sand px-3 py-1 text-sm font-medium"
            >
              <HugeiconsIcon icon={Layers01Icon} size={14} strokeWidth={2} />
              {track}
            </span>
          ))}
        </div>
      </div>

      <div className="flex mt-10 lg:hidden" onClick={hideRail}>
        <Button className="ml-auto">Continue</Button>
      </div>
    </aside>
  );
}

function useCountdown(deadline: string | Date | number): number {
  const getRemaining = (): number =>
    Math.max(0, new Date(deadline).getTime() - Date.now());

  const [remaining, setRemaining] = useState<number>(getRemaining);

  useEffect(() => {
    const update = (): void => {
      setRemaining(getRemaining());
    };

    update();

    const interval: ReturnType<typeof setInterval> = setInterval(update, 1000);

    return (): void => {
      clearInterval(interval);
    };
  }, [deadline]);

  return remaining;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) {
    return "Deadline passed";
  }

  const totalSeconds: number = Math.floor(ms / 1000);

  const days: number = Math.floor(totalSeconds / 86400);
  const hours: number = Math.floor((totalSeconds % 86400) / 3600);
  const minutes: number = Math.floor((totalSeconds % 3600) / 60);
  const seconds: number = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  }

  return `${minutes}m ${seconds}s remaining`;
}

function SubmissionDeadline({
  submissionDeadline,
}: {
  submissionDeadline: string;
}): React.ReactNode {
  const remaining = useCountdown(submissionDeadline);

  return (
    <RailRow
      icon={Hourglass}
      title={`Submission closes · ${formatDate(submissionDeadline)}`}
      detail={formatRemaining(remaining)}
    />
  );
}

function RailRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof CalendarDays;
  title: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center"
      >
        <Icon className="size-3.5 text-brandx" strokeWidth={2.2} />
      </dt>
      <dd>
        <span className="font-semibold">{title}</span>
        {detail && (
          <>
            <br />
            <span className="text-ink/60">{detail}</span>
          </>
        )}
      </dd>
    </div>
  );
}
