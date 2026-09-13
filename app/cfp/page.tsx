"use client";

import { useState } from "react";
import { Branding } from "@/components/cfp/branding";
import { ConfirmationStep } from "@/components/cfp/confirmation";
import { OverviewStep } from "@/components/cfp/overview";
import { ParticipantForm } from "@/components/cfp/participant";
import { ProposalForm } from "@/components/cfp/proposal";
import { Rail } from "@/components/cfp/rail";
import { SignupStep } from "@/components/cfp/signup";
import { Button } from "@/components/ui/button";
import { createUploadProvider, resolveAttachment } from "@/dsl-runtime/upload";
import { currentUser, eventCfpConfig, speakers } from "@/lib/cfp/mock-data";
import type { CurrentUser } from "@/lib/cfp/types";
import {
  genericConclusion,
  genericWelcome,
  participantTemplate,
  proposalTemplate,
} from "@/lib/constant";
import "./styles.css";

export const demoContent = `form {
  name: "Speaker Application"
  description: "Submit your speaker details"

  attachment headshot "Headshot picture" {
    placeholder("Upload a decent headshot for your profile");
  }
}`;

const steps = [
  { id: "overview", label: "Overview" },
  { id: "signup", label: "Signup" },
  { id: "details", label: "Details" },
  { id: "proposal", label: "Proposal" },
  { id: "done", label: "Done" },
];

const uploadUrl = "http://localhost:3000/api";
const getFileUrl = "http://localhost:3000/api";

export default function CfpFlow() {
  const { event, welcomeForm } = eventCfpConfig;
  const eventId = event._id;

  const [stepIndex, setStepIndex] = useState(0);
  const [user, setUser] = useState<CurrentUser | undefined>(currentUser);
  const [isSpeaker, setIsSpeaker] = useState(
    speakers.some(
      (s) => s.userId === currentUser._id && s.eventId === event._id,
    ),
  );

  const [hideRail, setHideRail] = useState(false);

  const goTo = (index: number) => {
    setStepIndex(index);
  };

  const handleAuthenticate = async ({
    name,
    email,
  }: {
    name: string;
    email: string;
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser({ _id: `user_${email}`, name, email });
    setIsSpeaker(true);
    goTo(2);
  };

  const branding = event.branding;

  return (
    <Branding
      branding={branding}
      className="cfp-surface relative min-h-screen overflow-hidden font-body text-ink"
    >
      {branding?.backgroundImageUrl && (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${branding.backgroundImageUrl})` }}
        />
      )}
      <div className="pointer-events-none absolute -top-40 -right-24 size-[520px] rounded-full bg-gold/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 size-[420px] rounded-full bg-brand/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt=""
                className="size-11 rounded-2xl object-cover"
              />
            ) : (
              <div className="grid size-11 place-items-center rounded-full bg-primary text-cream shadow-lg">
                <span className="font-heading text-2xl leading-none italic">
                  {event.eventName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="font-heading text-lg leading-none font-semibold tracking-tight">
                {branding?.logoLabel ?? event.eventName}
              </div>
              <div className="mt-1 text-xs tracking-[0.22em] text-brand-deep/70 uppercase">
                {/* Call for proposals */}
                CFP Studio
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center">
            <Button>Portal</Button>
          </div>
        </header>

        <div className="overflow-hidden rounded-lg border-white/70 bg-cream/85  shadow-md border backdrop-blur-smx">
          <div className={`grid lg:grid-cols-[1.1fr_1fr]`}>
            <Rail
              event={event}
              className={`lg:block ${hideRail ? "hidden" : ""}`}
              hideRail={() => setHideRail(true)}
            />

            <main
              className={`p-7 sm:p-9 lg:w-2xl min-h-[34rem] w-[22rem] sm:w-[47rem] lg:block ${hideRail ? "block" : "hidden"}`}
            >
              <div className="mb-3 lg:mb-5 flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-[0.2em] text-brand uppercase">
                  Step {stepIndex + 1} of {steps.length}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-sand" />
              </div>

              {stepIndex === 0 && (
                <OverviewStep
                  event={event}
                  welcomeContent={genericWelcome}
                  onStart={() => goTo(1)}
                />
              )}

              {stepIndex === 1 && (
                <SignupStep
                  user={user}
                  isExistingSpeaker={isSpeaker}
                  eventName={event.eventName}
                  onContinueAsUser={() => {
                    setIsSpeaker(true);
                    goTo(2);
                  }}
                  onAuthenticate={handleAuthenticate}
                  onBack={() => goTo(0)}
                />
              )}

              {stepIndex === 2 && (
                <ParticipantForm
                  src={participantTemplate}
                  // src={demoContent}
                  uploadFile={createUploadProvider(uploadUrl, {
                    eventId,
                    formType: "participant",
                  })}
                  getFile={resolveAttachment(getFileUrl)}
                  onBack={() => goTo(1)}
                  onSubmit={async (values) => {
                    console.log("Values: ", values);

                    // goTo(3);
                  }}
                  // defaultValues={{
                  //   headshot: "a32202ed-7e21-48b2-b7a4-53751e5f53b2",
                  // }}
                />
              )}

              {stepIndex === 3 && (
                <ProposalForm
                  src={proposalTemplate}
                  uploadFile={createUploadProvider("/api", {
                    eventId,
                    formType: "proposal",
                  })}
                  getFile={resolveAttachment("http://localhost:3000/api")}
                  onBack={() => goTo(2)}
                  onSubmit={async (values) => {
                    console.log("Values: ", values);

                    goTo(4);
                  }}
                />
              )}

              {stepIndex === 4 && (
                <ConfirmationStep 
                  content={genericConclusion}
                  onSubmitAnother={() => goTo(3)}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </Branding>
  );
}
