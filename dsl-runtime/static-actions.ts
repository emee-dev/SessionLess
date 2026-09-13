import { MAX_ATTACHMENT_UPLOAD_SIZE } from "@/lib/constant";
import { parseSize } from "@/lib/utils";
import {
  type ActionArgument,
  booleanArgument,
  numberArgument,
  parseActions,
  stringArgument,
} from "./action-parser";
import { evaluateExpr } from "./expression-runtime";
import type { Metadata, StaticActions, Values } from "./types";

type Actions =
  | "placeholder"
  | "minlength"
  | "maxlength"
  | "required"
  | "maxsize"
  | "hide"
  | "show"
  | "accepts";

type StaticAction = (
  config: Metadata,
  args: ActionArgument[],
  actionName: string,
) => void;

const staticActions: Record<Actions, StaticAction> = {
  placeholder: (config, args, actionName) => {
    config.placeholder = stringArgument(args[0], actionName);
  },

  minlength: (config, args, actionName) => {
    config.minLength = numberArgument(args[0], actionName);
  },

  maxlength: (config, args, actionName) => {
    config.maxLength = numberArgument(args[0], actionName);
  },

  required: (config, args, actionName) => {
    config.required = booleanArgument(args[0], actionName);
  },

  maxsize: (config, args, actionName) => {
    const _size = parseSize(stringArgument(args[0], actionName));

    config.maxSize =
      _size <= MAX_ATTACHMENT_UPLOAD_SIZE ? _size : MAX_ATTACHMENT_UPLOAD_SIZE;
  },

  hide: (config) => {
    config.visible = false;
  },

  show: (config) => {
    config.visible = true;
  },

  /**
   * @example
   * ```ts
   * accepts("*.{pdf,png}")
   * ```
   */
  accepts: (config, args, actionName) => {
    const pattern = stringArgument(args[0], actionName);
    const extensions = pattern
      .trim()
      .replace(/^\*\.\{?/, "")
      .replace(/\}?$/, "")
      .split(",")
      .map((extension: string) => extension.trim())
      .filter(Boolean);

    config.accepts = extensions ?? [];
  },
};

function applyStaticAction(
  config: Metadata,
  actionName: string,
  args: ActionArgument[],
): void {
  staticActions[actionName as Actions]?.(config, args, actionName);
}

export function isStaticAction(actionName: Actions): boolean {
  return (
    [
      "placeholder",
      "minlength",
      "maxlength",
      "required",
      "maxsize",
      "hide",
      "show",
      "accepts",
    ] as Actions[]
  ).includes(actionName);
}

export function resolveStaticActions(
  entries: StaticActions[],
  values: Values,
): Map<string, Metadata> {
  const result: Map<string, Metadata> = new Map();

  for (const entry of entries) {
    if (entry.expr && !evaluateExpr(entry.expr, values)) {
      continue;
    }

    if (!entry.target) continue;

    const config: Metadata = result.get(entry.target) ?? {
      maxSize: MAX_ATTACHMENT_UPLOAD_SIZE,
    };

    for (const action of parseActions(entry.action)) {
      if (isStaticAction(action.name as Actions)) {
        applyStaticAction(config, action.name, action.args);
      }
    }

    result.set(entry.target, config);
  }

  return result;
}
