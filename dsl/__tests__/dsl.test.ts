import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseFormDSL } from "../generated/grammar";

const tests = join(process.cwd(), "dsl", "__tests__");
const inputDSL = join(tests, "input.tio");
const outputJson = join(tests, "output.json");

describe("action list rendering (standalone, no condition)", () => {
  test("comma separated actions after 'then' are joined into one action string", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        text submit_btn "Submit" {
          if _.name === 'Abc' then show("submit_btn"), require("submit_btn", "error msg");
        }
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].actions).toEqual([
      {
        expr: "_.name === 'Abc'",
        action: 'show("submit_btn"); require("submit_btn", "error msg");',
      },
    ]);
  });
});

describe("conditional with logical operators", () => {
  test("'and' combined comparisons are preserved verbatim in expr", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        text name "Full Name" {
          if _.name === 'Abc' and _.age >= 10 then show(""), hide("");
        }
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].actions).toEqual([
      {
        expr: "_.name === 'Abc' and _.age >= 10",
        action: 'show(""); hide("");',
      },
    ]);
  });
});

describe("static (unconditioned) actions", () => {
  test("standalone actions inside a field are hoisted into the top-level static array", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        number age "Age" {
          minlength(18);
          placeholder("Your age");
        }
      }
    `;
    const out = parseFormDSL(src);

    expect(out.static).toEqual([
      { expr: "", action: "minlength(18);", target: "age" },
      { expr: "", action: 'placeholder("Your age");', target: "age" },
    ]);
    // static actions do not appear in the field's own actions array
    expect(out.fields[0].actions).toEqual([]);
  });
});

describe("field labels", () => {
  test("explicit label is used when provided", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        text name "Full Name" {}
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].label).toBe("Full Name");
  });

  test("label defaults to the field id when omitted", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        number score {}
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].id).toBe("score");
    expect(out.fields[0].label).toBe("score");
  });
});

describe("reference fields and dotted ids", () => {
  test("dotted ids (e.g. event.room) parse and are used as-is for id/target", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        reference event.room "Event Room" {
          required(true)
        }
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0]).toEqual({
      type: "reference",
      id: "event.room",
      label: "Event Room",
      modifier: "private",
      actions: [],
    });
    expect(out.static).toEqual([
      { expr: "", action: "required(true);", target: "event.room" },
    ]);
  });

  test("an empty field body parses to no actions and no static entries", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        reference on_submit_event "Submit application" {

        }
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0]).toEqual({
      type: "reference",
      id: "on_submit_event",
      label: "Submit application",
      modifier: "private",
      actions: [],
    });
    expect(out.static).toEqual([]);
  });
});

describe("field visibility (`pub` modifier)", () => {
  test("fields are private by default", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        text name "Full Name" {}
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].modifier).toBe("private");
  });

  test("a leading `pub` keyword marks the field public", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        pub text name "Full Name" {}
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].type).toBe("text");
    expect(out.fields[0].id).toBe("name");
    expect(out.fields[0].modifier).toBe("public");
  });

  test("`pub` works alongside conditions, static actions, and dotted/reference ids", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        pub reference event.room "Event Room" {
          required(true)
        }
        text age "Age" {
          minlength(18);
        }
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].id).toBe("event.room");
    expect(out.fields[0].modifier).toBe("public");
    expect(out.fields[1].id).toBe("age");
    expect(out.fields[1].modifier).toBe("private");
    // static actions still get hoisted correctly regardless of visibility
    expect(out.static).toEqual([
      { expr: "", action: "required(true);", target: "event.room" },
      { expr: "", action: "minlength(18);", target: "age" },
    ]);
  });
});

describe("form metadata", () => {
  test("name / description / defaultValues are parsed onto the top-level output", () => {
    const src = `
      form {
        name: "Speaker Application"
        description: "Speaker submission form"
        defaultValues: {
          country: "NG"
          age: 20
        }
      }
    `;
    const out = parseFormDSL(src);
    expect(out.name).toBe("Speaker Application");
    expect(out.description).toBe("Speaker submission form");
    expect(out.defaultValues).toEqual({ country: "NG", age: 20 });
  });
});

describe("full form example (end-to-end)", () => {
  const src = readFileSync(inputDSL, "utf-8");
  const expected = JSON.parse(readFileSync(outputJson, "utf-8"));

  test("produces the exact combined JSON shape described in the spec", () => {
    const out = parseFormDSL(src);

    expect(out).toEqual(expected);
  });
});

describe("expression capture (raw, unparsed)", () => {
  test("the condition is captured verbatim - any operators are passed through as-is for expr-eval to interpret", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        text name "Full Name" {
          if _.age >= 10 and (_.country == 'NG' or _.country == 'GH') then show("x");
        }
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].actions[0].expr).toBe(
      "_.age >= 10 and (_.country == 'NG' or _.country == 'GH')",
    );
  });

  test("a `then` occurring inside a quoted string does not end the capture early", () => {
    const src = `
      form {
        name: "T"
        description: "T"
        defaultValues: {}
        text name "Full Name" {
          if _.note == 'now then later' then show("x");
        }
      }
    `;
    const out = parseFormDSL(src);
    expect(out.fields[0].actions[0].expr).toBe("_.note == 'now then later'");
  });
});

describe("error handling", () => {
  test("throws a parse error for malformed input", () => {
    const src = `
      form {
        name "missing colon"
      }
    `;
    expect(() => parseFormDSL(src)).toThrow();
  });
});
