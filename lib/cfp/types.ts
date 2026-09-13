import { EventDoc } from "@/components/cfp/confirmation";

export interface SpeakerDoc {
  _id: string;
  userId: string;
  eventId: string;
}

export interface CurrentUser {
  _id: string;
  name: string;
  email: string;
}

export interface EventCfpConfig {
  event: EventDoc;
  welcomeForm: { content: string };
}
