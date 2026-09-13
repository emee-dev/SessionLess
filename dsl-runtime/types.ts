import React from "react";
import { ActionRegistry } from "./action-runtime";
import { ResolveAttachment } from "./form-context";
import { UploadProvider } from "./upload";

export interface FormProps {
  src: string;
  components?: ComponentRegistry;
  actions?: ActionRegistry;
  uploadFile?: UploadProvider;
  getFile?: ResolveAttachment;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  onBack?: () => void;
  className?: string;
  defaultValues?: Record<string, unknown>;
}

export type ConvexUploadResult = { storageId: string };

export type FormValue = unknown;
export type Values = Record<string, FormValue>;

export interface FieldAction {
  expr?: string;
  action: string;
}

export interface StaticActions extends FieldAction {
  target?: string;
}

export type Field = {
  type: FieldType;
  id: string;
  label: string;
  /** "public" if declared with a leading `pub` modifier.
   * @default "private"
   */
  modifier: "public" | "private";
  actions: FieldAction[];
};

export interface TioForm {
  name: string;
  description: string;
  defaultValues: Record<string, unknown>;
  static: StaticActions[];
  fields: Field[];
}

export interface Metadata {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  maxSize: number;
  visible?: boolean;
  accepts?: string[];
}

export interface FieldState {
  visible: boolean;
  required: boolean;
  metadata: Metadata;
  error?: string;
}

export interface FormRuntime {
  values: Values;
  fields: Record<string, FieldState>;
  isSubmitting: boolean;
}

export type ReferenceFieldProps = {
  id: string;
  label: string;
};

export type References = "event.room" | "event.track";

export type ReferenceRenderer = (props: ReferenceFieldProps) => React.ReactNode;
export type FieldRenderer = (props: Field) => React.ReactNode;

export type ComponentRegistry = {
  text: FieldRenderer;
  longText: FieldRenderer;
  number: FieldRenderer;
  attachment: FieldRenderer;
  checkbox: FieldRenderer;

  "event.room": FieldRenderer;
  "event.track": FieldRenderer;
};

export type FieldType = "reference" | keyof ComponentRegistry;
export type NodeTypes = Exclude<keyof ComponentRegistry, References>;
