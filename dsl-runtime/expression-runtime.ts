import { Parser, Value } from "expr-eval-fork";
import { ExprError } from "./errors";
import type { Values } from "./types";

const parser = new Parser({
  operators: {
    assignment: false,
  },
});

function setNestedValue(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const parts: string[] = path.split(".");
  let current: Record<string, unknown> = target;

  for (let index: number = 0; index < parts.length - 1; index += 1) {
    const part: string = parts[index];

    if (
      typeof current[part] !== "object" ||
      current[part] === null ||
      Array.isArray(current[part])
    ) {
      current[part] = {};
    }

    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

export function createContext(values: Values): Record<string, unknown> {
  const namespace: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    setNestedValue(namespace, key, value);
  }

  return { _: namespace };
}

export function evaluateExpr(expr: string, values: Values) {
  if (!expr.trim()) {
    return true;
  }

  try {
    const result: unknown = parser.evaluate(
      expr,
      createContext(values) as Value,
    );

    return Boolean(result);
  } catch (error: unknown) {
    throw new ExprError(
      expr,
      error instanceof Error ? error.message : String(error),
    );
  }
}
