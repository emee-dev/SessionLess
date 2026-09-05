// ============================================================================
// Semantic validation layer.
//
// Everything the grammar deliberately does NOT know about lives here:
//   - which field types exist ("text", "number", "select", ...)
//   - which rules/functions exist ("required", "show", "max", ...) and
//     which field types they're valid for
//   - which option names a rule's options object may contain
//   - which reference sources actually exist ("event.room", ...)

import type { FormAST, FormFieldNode, RuleNode } from "./ast";
import { isReferenceField } from "./parser";

export interface RuleSchema {
  /** Field types this rule may be attached to. Use "*" to allow any/all,
   *  including the special scope "on_submit_event". */
  allowedScopes: string[] | "*";
  /** Allowed option keys inside the rule's optional second (options)
   *  argument, e.g. ["error", "when"]. Use "*" to allow any keys. */
  allowedOptions?: string[] | "*";
}

export interface DSLSchema {
  /** Recognized field types, e.g. ["text", "number", "select", "attachment"]. */
  fieldTypes: string[];
  /** Recognized rule/function names, keyed by rule name. */
  rules: { [ruleName: string]: RuleSchema };
  /** Recognized reference source paths, e.g. ["event.room", "event.track"]. */
  referenceSources: string[];
}

export interface ValidationIssue {
  message: string;
  path: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

function validateRule(
  rule: RuleNode,
  schema: DSLSchema,
  path: string,
  issues: ValidationIssue[],
): void {
  const ruleSchema = schema.rules[rule.type];
  if (!ruleSchema) {
    issues.push({
      path,
      message: `Unknown rule "${rule.type}".`,
    });
    return;
  }

  if (
    ruleSchema.allowedScopes !== "*" &&
    !ruleSchema.allowedScopes.includes(rule.scope)
  ) {
    issues.push({
      path,
      message: `Rule "${rule.type}" is not allowed on "${rule.scope}".`,
    });
  }

  const options = rule.args[1];
  if (
    options &&
    typeof options === "object" &&
    !Array.isArray(options) &&
    ruleSchema.allowedOptions &&
    ruleSchema.allowedOptions !== "*"
  ) {
    for (const key of Object.keys(options)) {
      if (!ruleSchema.allowedOptions.includes(key)) {
        issues.push({
          path: `${path}.options.${key}`,
          message: `Unknown option "${key}" for rule "${rule.type}".`,
        });
      }
    }
  }
}

function validateField(
  field: FormFieldNode,
  schema: DSLSchema,
  index: number,
  issues: ValidationIssue[],
): void {
  const path = `fields[${index}]`;

  if (isReferenceField(field)) {
    if (!schema.referenceSources.includes(field.source)) {
      issues.push({
        path,
        message: `Unknown reference source "${field.source}".`,
      });
    }
  } else if (!schema.fieldTypes.includes(field.type)) {
    issues.push({
      path,
      message: `Unknown field type "${field.type}".`,
    });
  }

  field.rules.forEach((rule, ruleIndex) => {
    validateRule(rule, schema, `${path}.rules[${ruleIndex}]`, issues);
  });
}

/**
 * Validate a parsed `FormAST` against a caller-supplied schema describing
 * currently-known field types, rules, and reference sources.
 */
export function validateForm(
  form: FormAST,
  schema: DSLSchema,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  form.fields.forEach((field, index) =>
    validateField(field, schema, index, issues),
  );

  if (form.submitEvent) {
    form.submitEvent.rules.forEach((rule, ruleIndex) => {
      validateRule(rule, schema, `submitEvent.rules[${ruleIndex}]`, issues);
    });
  }

  return { valid: issues.length === 0, issues };
}
