"use client";

import { FileTextIcon, XIcon } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
  Field as FormField,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatBytes, getExtension, getFilename } from "@/lib/utils";
import {
  useFieldError,
  useFieldState,
  useFieldValue,
  useFormStore,
  useSetFieldValue,
} from "./form-context";
import type {
  ComponentRegistry,
  Field,
  NodeTypes,
  ReferenceFieldProps,
  References,
} from "./types";

export function TextField(field: Field): React.ReactNode {
  const value = useFieldValue<string>(field.id) ?? "";
  const state = useFieldState(field.id);
  const error = useFieldError(field.id);
  const isInvalid = !!error;
  const setValue = useSetFieldValue();

  if (!state?.visible) return null;

  return (
    <FormField data-invalid={isInvalid}>
      <FieldLabel className="text-sm font-medium">{field.label}</FieldLabel>

      <Input
        id={field.id}
        value={value}
        placeholder={state.metadata.placeholder}
        maxLength={state.metadata.maxLength}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(field.id, event.target.value);
        }}
        className={cn("w-full rounded-lg", isInvalid && "border-red-500")}
        data-invalid={isInvalid}
      />

      {error && (
        <FieldDescription className="text-red-500">{error}</FieldDescription>
      )}
    </FormField>
  );
}

export function LongTextField(field: Field): React.ReactNode {
  const value = useFieldValue<string>(field.id) ?? "";
  const state = useFieldState(field.id);
  const error = useFieldError(field.id);
  const isInvalid = !!error;
  const setValue = useSetFieldValue();

  const maxlength = state.metadata.maxLength;

  const charCount =
    maxlength && (field.type === "text" || field.type === "longText")
      ? `${String(value ?? "").length} / ${maxlength}`
      : undefined;

  if (!state?.visible) return null;

  return (
    <FormField data-invalid={isInvalid} className="col-span-2">
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel className="text-sm font-medium">{field.label}</FieldLabel>

        {charCount && (
          <span className="text-[11px] text-ink/40">{charCount}</span>
        )}
      </div>

      <Textarea
        id={field.id}
        value={value}
        placeholder={state.metadata.placeholder}
        maxLength={state.metadata.maxLength}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          setValue(field.id, event.target.value);
        }}
        className={cn(
          "min-h-32 w-full resize-y rounded-lg",
          isInvalid && "border-red-500",
        )}
        data-invalid={isInvalid}
        rows={
          state.metadata.maxLength && state.metadata.maxLength > 400 ? 6 : 3
        }
      />

      {error && (
        <FieldDescription id={`${field.id}-error`} className="text-red-500">
          {error}
        </FieldDescription>
      )}
    </FormField>
  );
}

export function CheckboxField(field: Field): React.ReactNode {
  const value = useFieldValue<string>(field.id) ?? "";
  const state = useFieldState(field.id);
  const error = useFieldError(field.id);
  const isInvalid = !!error;
  const setValue = useSetFieldValue();

  if (!state?.visible) return null;

  return (
    <FieldLabel className="rounded-lg col-span-2">
      <FormField orientation="horizontal" data-invalid={isInvalid}>
        <Checkbox
          id={field.id}
          name={field.id}
          checked={Boolean(value)}
          onCheckedChange={(checked) => {
            setValue(field.id, checked);
          }}
          className="rounded-sm"
        />
        <FieldContent>
          <FieldTitle className="text-sm">{field.label}</FieldTitle>

          {error !== undefined ? (
            <FieldDescription className="text-red-500">
              {error}
            </FieldDescription>
          ) : state.metadata.placeholder ? (
            <FieldDescription>{state.metadata.placeholder}</FieldDescription>
          ) : null}
        </FieldContent>
      </FormField>
    </FieldLabel>
  );
}

export function NumberField(field: Field): React.ReactNode {
  const value = useFieldValue<number>(field.id) ?? "";
  const state = useFieldState(field.id);
  const error = useFieldError(field.id);
  const isInvalid = !!error;
  const setValue = useSetFieldValue();

  if (!state?.visible) return null;

  return (
    <FormField data-invalid={isInvalid}>
      <FieldLabel className="text-sm font-medium">{field.label}</FieldLabel>

      <Input
        id={field.id}
        type="number"
        value={value}
        placeholder={state.metadata.placeholder}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const raw: string = event.target.value;

          setValue(field.id, raw === "" ? null : Number(raw));
        }}
        className="w-full rounded-lg"
        data-invalid={isInvalid}
      />

      {error && (
        <FieldDescription className="text-red-500">{error}</FieldDescription>
      )}
    </FormField>
  );
}

export function AttachmentField(field: Field): React.ReactNode {
  const value = useFieldValue<File | null>(field.id) ?? null;
  const state = useFieldState(field.id);
  const error = useFieldError(field.id);
  const isInvalid = !!error;
  const setValue = useSetFieldValue();
  const maxSize = state.metadata.maxSize ?? 10 * 1024 * 1024;

  const ref = useRef<HTMLInputElement>(null);

  if (!state?.visible) return null;

  const handleUpload = (): void => {
    ref.current?.showPicker();
  };

  const handleRemove = (event: React.MouseEvent): void => {
    event.stopPropagation();

    setValue(field.id, null);

    // Allow selecting the same file again.
    if (ref.current) {
      ref.current.value = "";
    }
  };

  let title = "";

  if (value?.name) {
    title = getFilename(value?.name);
  } else if (state.metadata.placeholder !== undefined) {
    title = state.metadata.placeholder;
  } else {
    title = "Choose a file";
  }

  const validExtensions: string = state.metadata.accepts?.length
    ? state.metadata.accepts
        .map((extension: string) => extension.replace(/^\./, "").toUpperCase())
        .join(", ")
    : "All file types";

  const description: string = value
    ? `${getExtension<string>(value)?.toUpperCase() ?? "FILE"} · ${formatBytes(value.size)}`
    : `${validExtensions} · Max ${formatBytes(maxSize)}`;

  return (
    <FormField className="col-span-2 bg-green-500x" data-invalid={isInvalid}>
      <FieldLabel className="text-sm font-medium">{field.label}</FieldLabel>

      <Attachment
        className="w-full cursor-pointer rounded-lg"
        state={isInvalid ? "error" : "done"}
      >
        <AttachmentMedia onClick={handleUpload}>
          <FileTextIcon />
        </AttachmentMedia>

        <AttachmentContent onClick={handleUpload}>
          <AttachmentTitle>{title}</AttachmentTitle>

          <AttachmentDescription>{description}</AttachmentDescription>
        </AttachmentContent>

        {value && (
          <AttachmentActions>
            <AttachmentAction
              type="button"
              onClick={handleRemove}
              aria-label="Remove file"
            >
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        )}
      </Attachment>

      <input
        id={field.id}
        ref={ref}
        type="file"
        className="hidden"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const file: File | undefined = event.target.files?.[0];

          setValue(field.id, file ?? null);
        }}
      />

      {error && (
        <FieldDescription className="text-red-500">{error}</FieldDescription>
      )}
    </FormField>
  );
}

export function RoomSelector(field: ReferenceFieldProps): React.ReactNode {
  const value = useFieldValue<string>(field.id) ?? "";
  const state = useFieldState(field.id);
  const error = useFieldError(field.id);
  const isInvalid = !!error;
  const setValue = useSetFieldValue();

  if (!state?.visible) return null;

  return (
    <FormField data-invalid={isInvalid}>
      <FieldLabel className="text-sm font-medium">{field.label}</FieldLabel>
      <Select
        value={value}
        onValueChange={(value) => setValue(field.id, value)}
      >
        <SelectTrigger
          className={cn("w-full rounded-lg", isInvalid && "border-red-500")}
          data-invalid={isInvalid}
        >
          <SelectValue placeholder={state.metadata.placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select room</SelectLabel>
            <SelectItem value="Room A">Room A</SelectItem>
            <SelectItem value="Room B">Room B</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {error && (
        <FieldDescription className="text-red-500">{error}</FieldDescription>
      )}
    </FormField>
  );
}

export function TrackSelector(field: ReferenceFieldProps): React.ReactNode {
  const value = useFieldValue<string>(field.id) ?? "";
  const state = useFieldState(field.id);
  const error = useFieldError(field.id);
  const isInvalid = !!error;
  const setValue = useSetFieldValue();

  if (!state?.visible) return null;

  return (
    <FormField data-invalid={isInvalid}>
      <FieldLabel className="text-sm font-medium">{field.label}</FieldLabel>
      <Select
        value={value}
        onValueChange={(value) => setValue(field.id, value)}
      >
        <SelectTrigger
          className={cn("w-full rounded-lg", isInvalid && "border-red-500")}
          data-invalid={isInvalid}
        >
          <SelectValue placeholder={state.metadata.placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select track</SelectLabel>
            <SelectItem value="Developer experience">
              Developer experience
            </SelectItem>
            <SelectItem value="Vibe coding">Vibe coding</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {error && (
        <FieldDescription className="text-red-500">{error}</FieldDescription>
      )}
    </FormField>
  );
}

export interface FormSubmitProps {
  children?: React.ReactNode;
  className?: string;
}

export function FormSubmit({
  children = "Submit",
  className = "",
}: FormSubmitProps): React.ReactNode {
  const submit = useFormStore((state) => state.submit);
  const isSubmitting = useFormStore((state) => state.isSubmitting);

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      onClick={(event) => {
        event.preventDefault();
        void submit();
      }}
      className={cn(
        "rounded-md bg-black px-4 py-2 text-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {isSubmitting ? "Submitting..." : children}
    </button>
  );
}

const FIELD_ORDER = [
  { type: "text" },
  { type: "number" },
  { id: "event.room" },
  { id: "event.track" },
  { type: "longText" },
  { type: "attachment" },
  { type: "checkbox" },
] satisfies ({ type: NodeTypes } | { id: References })[];

const getFieldOrder = (field: Field): number => {
  const index = FIELD_ORDER.findIndex((rule) => {
    if ("id" in rule) {
      return field.id === rule.id;
    }

    return field.type === rule.type;
  });

  // Unknown fields go to the end.
  return index === -1 ? FIELD_ORDER.length : index;
};

export const renderFields = (
  fields: Field[],
  components: ComponentRegistry,
): React.ReactNode[] => {
  return fields
    .sort((a, b) => getFieldOrder(a) - getFieldOrder(b))
    .map((field) => {
      const componentKey = field.type === "reference" ? field.id : field.type;
      const Component = components[componentKey as keyof ComponentRegistry];
      if (!Component) return null;

      return <Component key={field.id} {...field} />;
    })
    .filter(Boolean);
};

export const components: ComponentRegistry = {
  text: (field) => <TextField {...field} />,
  longText: (field) => <LongTextField {...field} />,
  number: (field) => <NumberField {...field} />,
  attachment: (field) => <AttachmentField {...field} />,
  checkbox: (field) => <CheckboxField {...field} />,

  // References
  "event.room": (field) => <RoomSelector {...field} />,
  "event.track": (field) => <TrackSelector {...field} />,
};
