import {
  type ActionArgument,
  type ActionCall,
  parseActions,
  stringArgument,
} from "./action-parser";
import { evaluateExpr } from "./expression-runtime";
import type { FieldAction, FieldState, Values } from "./types";

export type ActionRegistry = Record<
  string,
  (args: ActionArgument[], ctx: Record<string, FieldState>) => void
>;

export const defaultActions: ActionRegistry = {
  /**
   * @example
   *
   * ```ts
   * if _.age <= 50 then show("tiktok");
   * ```
   */
  show: (args, ctx) => {
    const id = stringArgument(args[0], "show");
    ctx[id].visible = true;
  },

  /**
   * @example
   *
   * ```ts
   * if _.age >= 50 then hide("tiktok");
   * ```
   */
  hide: (args, ctx) => {
    const id = stringArgument(args[0], "hide");
    ctx[id].visible = false;
  },

  /**
   * @example
   *
   * ```ts
   * if _.country == 'US' then require("address");
   * ```
   */
  require: (args, ctx) => {
    const id = stringArgument(args[0], "require");
    ctx[id].required = true;
  },
};

function callAction(
  call: ActionCall,
  registry: ActionRegistry,
  draft: Record<string, FieldState>,
): void {
  const handler = registry[call.name];

  if (!handler) {
    throw new Error(`Unknown action "${call.name}"`);
  }

  handler(call.args, draft);
}

export function evaluateConditionalActions(
  entries: FieldAction[],
  values: Values,
  registry: ActionRegistry,
  draft: Record<string, FieldState>,
): void {
  for (const entry of entries) {
    if (!entry.expr?.length) return;

    const matches = evaluateExpr(entry.expr, values);
    if (!matches) continue;

    for (const action of parseActions(entry.action)) {
      callAction(action, registry, draft);
    }
  }
}
