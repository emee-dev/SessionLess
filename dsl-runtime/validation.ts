import { formatBytes, getFileExtension } from "@/lib/utils";
import type { Field, FieldState, Values } from "./types";

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function isChecked(value: unknown): boolean {
  return value === true;
}

function len(value: unknown): number {
  if (typeof value === "string") return value.length;
  if (Array.isArray(value)) return value.length;
  return 0;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateField(
  field: Field,
  state: FieldState,
  value: unknown,
): string | undefined {
  if (!state.visible) return undefined;

  if (field.type === "checkbox" && state.required && !isChecked(value)) {
    // return `${field.label} is required`;
    return `Please select this checkbox to continue.`;
  }

  if (state.required && isEmpty(value)) {
    return `${field.label} is required`;
  }

  if (state.metadata.minLength !== undefined && isEmpty(value)) {
    return `${field.label} must be at least ${state.metadata.minLength} characters`;
  }

  if (
    state.metadata.minLength !== undefined &&
    !isEmpty(value) &&
    len(value) < state.metadata.minLength
  ) {
    return `${field.label} must be at least ${state.metadata.minLength} characters`;
  }

  if (
    state.metadata.maxLength !== undefined &&
    !isEmpty(value) &&
    len(value) > state.metadata.maxLength
  ) {
    return `${field.label} must be at most ${state.metadata.maxLength} characters`;
  }

  const pattern = state.metadata.accepts;

  if (
    pattern?.length &&
    value instanceof File &&
    !isValidFile(pattern, value?.name?.split(".").pop()?.toLowerCase())
  ) {
    return `Valid attachments includes: ${pattern?.map((f) => f.toUpperCase())?.join(",")}`;
  }

  if (
    state.metadata.maxSize !== undefined &&
    value instanceof File &&
    value.size > state.metadata.maxSize
  ) {
    return `File size exceeds ${formatBytes(state.metadata.maxSize)}`;
  }

  return undefined;
}

function isValidFile(pattern: string[], extension?: string | null) {
  if (!extension) return false;
  return pattern.includes(extension);
}


export function validateForm(
  fields: Field[],
  runtimeFields: Record<string, FieldState>,
  values: Values,
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const state = runtimeFields[field.id];
    if (!state) continue;

    const error = validateField(field, state, values[field.id]);

    if (error) {
      errors[field.id] = error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
