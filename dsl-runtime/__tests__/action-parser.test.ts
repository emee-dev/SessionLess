import { describe, expect, it } from "bun:test";
import { parseActions } from "../action-parser";

describe("action parser", () => {
  it("parses semicolon-separated actions", () => {
    expect(
      parseActions('show("greeting"); hide("warning"); require("email")'),
    ).toEqual([
      { name: "show", args: ["greeting"] },
      { name: "hide", args: ["warning"] },
      { name: "require", args: ["email"] },
    ]);
  });

  it("does not split commas inside strings", () => {
    expect(parseActions('log("hello, world", nested("a,b"))')).toEqual([
      {
        name: "log",
        args: [
          "hello, world",
          {
            name: "nested",
            args: ["a,b"],
          },
        ],
      },
    ]);
  });
});
