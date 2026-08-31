// Two layers of types live here:
//
//   1. "Raw" syntax-tree types (RawFormItem, RawRule, ...) - these mirror
//      exactly what the Peggy grammar produces. They are intentionally
//      generic: a rule is just `{ type: string; args: DSLValue[] }`,
//      never a specific union of known rule names.
//
//   2. The final, shaped AST (FormAST, FieldNode, ReferenceNode, ...) that
//      src/parser.ts builds from the raw tree. This is what consumers of
//      the parser should use.
//

export type DSLValue =
  | string
  | number
  | boolean
  | null
  | DSLValue[]
  | { [key: string]: DSLValue };

// ---------------------------------------------------------------------------
// Raw syntax tree (as produced directly by the Peggy grammar)
// ---------------------------------------------------------------------------

export interface RawRule {
  /** The rule/function name, e.g. "required", "show", "readonly", ... */
  type: string;
  /** Positional arguments, in source order. */
  args: DSLValue[];
}

export interface RawFieldItem {
  kind: "field";
  fieldType: string;
  name: string;
  label: string;
  rules: RawRule[];
}

export interface RawReferenceItem {
  kind: "reference";
  /** Full dotted source path, e.g. "event.room". */
  source: string;
  label: string | null;
  rules: RawRule[];
}

export interface RawEventItem {
  kind: "event";
  name: "on_submit_event";
  rules: RawRule[];
}

export interface RawMetadataItem {
  kind: "metadata";
  key: string;
  value: DSLValue;
}

export type RawFormItem =
  | RawFieldItem
  | RawReferenceItem
  | RawEventItem
  | RawMetadataItem;

export interface RawForm {
  type: "form";
  items: RawFormItem[];
}

/**
 * A parsed rule/function invocation attached to a field, reference, or
 * the submit event. `scope` identifies which node the rule belongs to
 * (the field/reference name, or "on_submit_event").
 */
export interface RuleNode {
  type: string;
  scope: string;
  args: DSLValue[];
}

export interface FieldNode {
  type: string; // dynamic field type, e.g. "text", "number", "select", ...
  name: string;
  label: string;
  rules: RuleNode[];
}

export interface ReferenceNode {
  type: "reference";
  name: string; // last path segment, e.g. "room" for "event.room"
  source: string; // full dotted path, e.g. "event.room"
  label: string | null;
  rules: RuleNode[];
}

export interface EventNode {
  type: "event";
  name: "on_submit_event";
  rules: RuleNode[];
}

export type FormFieldNode = FieldNode | ReferenceNode;

/**
 * The final parsed form. `name`/`description` are pulled out of metadata
 * for convenience (defaulting to "" when absent), `defaultValues` is
 * pulled out of the `defaultValues` metadata block (defaulting to {}),
 * and any other metadata keys are preserved verbatim in `metadata` so
 * future/unknown top-level properties are never dropped.
 */
export interface FormAST {
  name: string;
  description: string;
  defaultValues: { [key: string]: DSLValue };
  metadata: { [key: string]: DSLValue };
  fields: FormFieldNode[];
  submitEvent: EventNode | null;
}
