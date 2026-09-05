// ============================================================================
// Parser wrapper.
//
// This is the only place that knows how to turn the *generic* raw syntax
// tree (produced by the Peggy grammar, which knows nothing about specific
// field types, rule names, or option names) into the final, shaped
// `FormAST`. It performs purely structural/syntactic shaping:
//
//   - separating metadata / fields / references / submit event
//   - pulling out well-known-by-*convention* (not by grammar) metadata
//     keys like "name", "description", "defaultValues"
//   - attaching a `scope` to each rule
//   - deriving a reference's short `name` from its dotted `source`
//
// It performs NO semantic validation: it never checks whether a rule
// exists, whether it's valid for a given field type, whether option names
// are allowed, or whether a reference source is real. That belongs in
// src/validate.ts, kept deliberately separate per the architecture
// requirements.
// ============================================================================

import {
  SyntaxError as PeggySyntaxError,
  parse as pegParse,
} from "../generated/grammar.js";
import type {
  DSLValue,
  EventNode,
  FormAST,
  FormFieldNode,
  RawEventItem,
  RawFieldItem,
  RawForm,
  RawFormItem,
  RawMetadataItem,
  RawReferenceItem,
  RawRule,
  ReferenceNode,
  RuleNode,
} from "./ast.js";

export { PeggySyntaxError as DSLSyntaxError };

/** Thrown for structural problems that aren't plain Peggy syntax errors. */
export class DSLParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DSLParseError";
  }
}

function isRecord(value: DSLValue): value is { [key: string]: DSLValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shapeRules(rules: RawRule[], scope: string): RuleNode[] {
  return rules.map((rule) => ({
    type: rule.type,
    scope: scope,
    args: rule.args,
  }));
}

function shapeField(item: RawFieldItem): FormFieldNode {
  return {
    type: item.fieldType,
    name: item.name,
    label: item.label,
    rules: shapeRules(item.rules, item.name),
  };
}

function shapeReference(item: RawReferenceItem): FormFieldNode {
  const segments = item.source.split(".");
  const name = segments[segments.length - 1];
  return {
    type: "reference",
    name: name,
    source: item.source,
    label: item.label,
    rules: shapeRules(item.rules, name),
  };
}

function shapeEvent(item: RawEventItem): EventNode {
  return {
    type: "event",
    name: "on_submit_event",
    rules: shapeRules(item.rules, item.name),
  };
}

export const isReferenceField = (
  item: FormFieldNode,
): item is ReferenceNode => {
  return item.type === "reference";
};

/**
 * Build the final FormAST from the raw syntax tree produced by the
 * grammar. Kept as a standalone, exported function so callers who already
 * have a raw tree (e.g. from tooling, or a custom entry point) can reuse
 * the shaping step without re-parsing.
 */
export function buildFormAST(raw: RawForm): FormAST {
  const metadata: { [key: string]: DSLValue } = {};
  const fields: FormFieldNode[] = [];
  let submitEvent: EventNode | null = null;

  for (const item of raw.items as RawFormItem[]) {
    switch (item.kind) {
      case "metadata": {
        const metaItem = item as RawMetadataItem;
        metadata[metaItem.key] = metaItem.value;
        break;
      }
      case "field": {
        fields.push(shapeField(item as RawFieldItem));
        break;
      }
      case "reference": {
        fields.push(shapeReference(item as RawReferenceItem));
        break;
      }
      case "event": {
        if (submitEvent !== null) {
          throw new DSLParseError(
            "Duplicate on_submit_event block: only one is allowed per form.",
          );
        }
        submitEvent = shapeEvent(item as RawEventItem);
        break;
      }
      default: {
        // Exhaustiveness guard - if the grammar ever grows a new item
        // kind, TypeScript will flag this as unreachable at compile time.
        const _exhaustive: never = item;
        throw new DSLParseError(
          `Unknown form item kind: ${JSON.stringify(_exhaustive)}`,
        );
      }
    }
  }

  const name = typeof metadata.name === "string" ? metadata.name : "";
  const description =
    typeof metadata.description === "string" ? metadata.description : "";
  const defaultValuesRaw = metadata.defaultValues;
  const defaultValues = isRecord(defaultValuesRaw) ? defaultValuesRaw : {};

  // Keep every metadata key (including name/description/defaultValues)
  // available verbatim in `metadata` too, so nothing is ever lost even
  // though we also surface the common ones as top-level convenience
  // fields.
  return {
    name,
    description,
    defaultValues,
    metadata,
    fields,
    submitEvent,
  };
}

export type {
  DSLValue,
  EventNode,
  FieldNode,
  FormAST,
  FormFieldNode,
  ReferenceNode,
  RuleNode,
} from "./ast.js";
