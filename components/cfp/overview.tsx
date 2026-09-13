import { Button } from "@/components/ui/button";
import { Markdown } from "../markdown";
import type { EventDoc } from "./confirmation";

export function OverviewStep({
  event,
  welcomeContent,
  onStart,
}: {
  event: EventDoc;
  welcomeContent: string;
  onStart: () => void;
}) {
  // const remaining = daysUntil(event.submissionDeadline, new Date("2025-08-10"));
  // const closed = remaining !== undefined && remaining <= 0;
  const closed = false;

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
        Overview
      </h2>

      <div className="mt-2 mb-4 lg:mb-8"></div>

      <div className="h-10 max-h-85 sm:h-52 sm:max-h-90 thin-scrollbar overflow-auto typeset typeset-article flex-1">
        <Markdown content={welcomeContent} />
      </div>

      <div className="mt-auto flex flex-col mb-5 gap-y-5">
        <dl className="hidden gap-3 sm:grid-cols-3 sm:grid">
          <Stat label="Event type" value={event.eventType} />
          <Stat
            label="Speakers so far"
            value={event.totalSpeakers.toLocaleString()}
          />
        </dl>

        <Button onClick={onStart} className="w-full" disabled={closed}>
          {closed ? "Submissions are closed" : "Start your submission"}
          {!closed && <span aria-hidden="true">→</span>}
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-sm border border-sand bg-white/40 px-4 py-3">
      <dt className="text-[10px] font-semibold tracking-[0.18em] text-ink/45 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
      {detail && <dd className="text-xs text-ink/50">{detail}</dd>}
    </div>
  );
}
