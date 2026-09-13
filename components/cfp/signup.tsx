import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import type { CurrentUser } from "@/lib/cfp/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StepFooter({
  onBack,
  onContinue,
  continueLabel,
  pendingLabel,
  pending,
  continueType = "button",
}: {
  onBack: () => void;
  onContinue?: () => void;
  continueLabel: string;
  pendingLabel: string;
  pending: boolean;
  continueType?: "button" | "submit";
}) {
  return (
    <div className="mt-auto flex w-full items-center gap-3 mb-5">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="px-5 py-3"
        onClick={onBack}
      >
        Back
      </Button>

      <Button
        type={continueType}
        className="flex-1"
        disabled={pending}
        onClick={continueType === "button" ? onContinue : undefined}
      >
        {pending ? pendingLabel : continueLabel}
      </Button>
    </div>
  );
}

type AccountTypes = "existingSpeakerAccount" | "newSpeakerAccount";

function AccountChoice({
  user,
  isExistingSpeaker,
  mode,
  onSetMode,
}: {
  user: CurrentUser;
  isExistingSpeaker: boolean;
  mode: AccountTypes;
  onSetMode: (value: AccountTypes) => void;
}) {
  return (
    <RadioGroup
      value={mode}
      onValueChange={onSetMode}
      className="grid gap-3 sm:grid-cols-2"
    >
      <FieldLabel className="rounded-sm">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className="text-lg font-medium">
              Continue as {user.name.split(" ")[0]}
            </FieldTitle>
            <FieldDescription>
              {isExistingSpeaker
                ? "Already a speaker here"
                : "New to this event"}
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="existingSpeakerAccount" />
        </Field>
      </FieldLabel>

      <FieldLabel className="rounded-sm">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className="text-lg font-medium">
              Use a different account
            </FieldTitle>
            <FieldDescription>
              Sign up or log in with your email
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="newSpeakerAccount" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}

function OnboardingFormFields({
  name,
  email,
  errors,
  onNameChange,
  onEmailChange,
}: {
  name: string;
  email: string;
  errors: { name?: string; email?: string };
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        id="signup-name"
        label="Your name"
        value={name}
        error={errors.name}
        onChange={onNameChange}
        placeholder="Elvis Maya"
      />
      <FormField
        id="signup-email"
        label="Email"
        type="email"
        value={email}
        error={errors.email}
        onChange={onEmailChange}
        placeholder="you@company.com"
      />
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  type?: string;
  placeholder?: string | undefined;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-ink"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:ring-2 focus:outline-none ${
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/25"
            : "border-sand focus:border-brand focus:ring-brand/25"
        }`}
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function useJoinForm(
  onAuthenticate: (details: {
    name: string;
    email: string;
  }) => Promise<void> | void,
) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string>();

  const validate = () => {
    const next: { name?: string; email?: string } = {};
    if (!name.trim()) next.name = "Tell us your name.";
    if (!emailPattern.test(email)) next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setPending(true);
    setFailure(undefined);

    try {
      await onAuthenticate({ name: name.trim(), email: email.trim() });
    } catch {
      setFailure("We couldn't sign you in just now. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return { name, setName, email, setEmail, errors, pending, failure, submit };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function SignupStep({
  user,
  isExistingSpeaker,
  eventName,
  onContinueAsUser,
  onAuthenticate,
  onBack,
}: {
  user?: CurrentUser | undefined;
  isExistingSpeaker: boolean;
  eventName: string;
  onContinueAsUser: () => void;
  onAuthenticate: (details: {
    name: string;
    email: string;
  }) => Promise<void> | void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<AccountTypes>(
    user ? "existingSpeakerAccount" : "newSpeakerAccount",
  );
  const [accountPending, setAccountPending] = useState(false);
  const form = useJoinForm(onAuthenticate);

  const handleContinueAsUser = () => {
    setAccountPending(true);
    onContinueAsUser();
  };

  return (
    // flex-col + h-full lets the footer sit at the bottom via mt-auto,
    // instead of the two branches hand-rolling their own spacing.
    <div className="flex h-full flex-col">
      <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
        Speaker signup
      </h2>

      <p className="mt-2 mb-6 text-sm text-ink/60">
        {isExistingSpeaker
          ? `You're already a speaker at ${eventName} — carry on and submit as many proposals as you like.`
          : "One quick step and you're associated with the event. You can submit more than one proposal afterwards."}
      </p>

      {user && (
        <AccountChoice
          user={user}
          isExistingSpeaker={isExistingSpeaker}
          mode={mode}
          onSetMode={setMode}
        />
      )}

      {mode === "newSpeakerAccount" && (
        <form
          className="mt-6 flex flex-1 flex-col"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void form.submit();
          }}
        >
          {user && (
            <div className="my-4 flex items-center">
              <Separator className="flex-1" />
              <span className="px-3 text-xs uppercase text-muted-foreground">
                Or
              </span>
              <Separator className="flex-1" />
            </div>
          )}

          <OnboardingFormFields
            name={form.name}
            email={form.email}
            errors={form.errors}
            onNameChange={form.setName}
            onEmailChange={form.setEmail}
          />

          {form.failure && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs font-medium text-destructive"
            >
              {form.failure}
            </p>
          )}

          <StepFooter
            onBack={onBack}
            continueType="submit"
            continueLabel="Continue"
            pendingLabel="Signing you in…"
            pending={form.pending}
          />
        </form>
      )}

      {mode === "existingSpeakerAccount" && (
        <StepFooter
          onBack={onBack}
          onContinue={handleContinueAsUser}
          continueLabel="Continue"
          pendingLabel="Signing you in…"
          pending={accountPending}
        />
      )}
    </div>
  );
}
