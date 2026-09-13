import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { EventBranding } from "./branding";

export interface EventDoc {
  _id: string;
  eventName: string;
  slug: string;
  eventType: string;
  website: string;
  location: string;
  tracks: string[];
  rooms: string[];
  theme: string;
  startsAt: string;
  endsAt: string;
  submissionDeadline: string;
  totalSubmissions: number;
  totalSpeakers: number;
  submissionsByTrack: { track: string; submissions: number }[];
  submissionsByRoom: { room: string; submissions: number }[];
  branding?: EventBranding;
}

export function ConfirmationStep({
  content,
  onSubmitAnother,
}: {
  content: string;
  onSubmitAnother: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            Conclusion
          </h2>
        </div>
      </div>

      <div className="h-52 max-h-90 thin-scrollbar overflow-auto flex-1 typeset typeset-article mt-10">
        <Markdown content={content} />
      </div>

      <div className="mt-auto flex mb-5 items-center gap-x-3">
        <Button onClick={onSubmitAnother} className="flex-1">
          Submit another proposal
        </Button>
      </div>
    </div>
  );
}
