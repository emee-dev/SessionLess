import { describe, expect, it } from "bun:test";
import { createContext, evaluateExpr } from "../expression-runtime";

describe("expression runtime", () => {
  it("supports dotted field IDs", () => {
    const context = createContext({
      "event.room": "room-a",
      age: 20,
    });

    expect((context._ as Record<string, unknown>).event).toEqual({
      room: "room-a",
    });

    expect(
      evaluateExpr('_.event.room == "room-a" and _.age >= 18', {
        "event.room": "room-a",
        age: 20,
      }),
    ).toBe(true);
  });
});
