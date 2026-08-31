import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FieldNode, ReferenceNode } from "./src/ast";
import { DSLParseError, DSLSyntaxError, parseForm } from "./src/parser";
import { validateForm } from "./src/validate";

const inputDSL = join(process.cwd(), "dsl", "input.tio");
const outputJson = join(process.cwd(), "dsl", "output.json");

test("parses the full example DSL and matches expected json exactly", () => {
  const source = readFileSync(inputDSL, "utf-8");
  const expected = JSON.parse(readFileSync(outputJson, "utf-8"));
  const actual = parseForm(source);

  expect(JSON.parse(JSON.stringify(actual))).toEqual(expected);
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

test("parses top-level metadata: name, description, and arbitrary keys", () => {
  const ast = parseForm(`
		form {
			name: "My Form"
			description: "A description"
			version: 3
			isPublished: true
		}
	`);

  expect(ast.name).toBe("My Form");
  expect(ast.description).toBe("A description");
  expect(ast.metadata.version).toBe(3);
  expect(ast.metadata.isPublished).toBe(true);
});

test("defaultValues metadata is parsed into a nested object and also exposed at top level", () => {
  const ast = parseForm(`
		form {
			name: "F"
			defaultValues: {
				country: "NG"
				age: 20
				verified: false
			}
		}
	`);

  expect(ast.defaultValues).toEqual({
    country: "NG",
    age: 20,
    verified: false,
  });

  expect(ast.metadata.defaultValues).toEqual({
    country: "NG",
    age: 20,
    verified: false,
  });
});

test("form with no metadata still parses with sensible defaults", () => {
  const ast = parseForm(`form { }`);

  expect(ast.name).toBe("");
  expect(ast.description).toBe("");
  expect(ast.defaultValues).toEqual({});
  expect(ast.fields).toEqual([]);
  expect(ast.submitEvent).toBe(null);
});

// ---------------------------------------------------------------------------
// Fields (dynamic field types)
// ---------------------------------------------------------------------------

test("parses fields with arbitrary/unknown field types without grammar changes", () => {
  const ast = parseForm(`
		form {
			widget_thing my_field "My Field" {}
			totallyMadeUpType another "Another" {}
		}
	`);

  expect(ast.fields.length).toBe(2);
  expect((ast.fields[0] as FieldNode).type).toBe("widget_thing");
  expect((ast.fields[0] as FieldNode).name).toBe("my_field");
  expect((ast.fields[0] as FieldNode).label).toBe("My Field");
  expect((ast.fields[1] as FieldNode).type).toBe("totallyMadeUpType");
});

test("parses standard field types from the spec", () => {
  const ast = parseForm(`
		form {
			text name "Full Name" {}
			number age "Age" {}
			select country "Country" {}
			attachment avatar "Headshot" {}
		}
	`);

  const types = ast.fields.map((f) => f.type);

  expect(types).toEqual(["text", "number", "select", "attachment"]);
});

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

test("parses reference fields with dotted source paths generically", () => {
  const ast = parseForm(`
		form {
			reference event.room "Event Room" {
				required(true)
			}
			reference submission.title "Title" {}
			reference event.location.venue "Venue" {}
		}
	`);

  const [room, title, venue] = ast.fields as ReferenceNode[];

  expect(room.type).toBe("reference");
  expect(room.name).toBe("room");
  expect(room.source).toBe("event.room");
  expect(room.label).toBe("Event Room");
  expect(room.rules[0].type).toBe("required");
  expect(room.rules[0].scope).toBe("room");

  expect(title.name).toBe("title");
  expect(title.source).toBe("submission.title");

  // Arbitrarily deep dotted paths work without grammar changes.
  expect(venue.name).toBe("venue");
  expect(venue.source).toBe("event.location.venue");
});

test("reference label is optional", () => {
  const ast = parseForm(`
		form {
			reference event.room {
				required(true)
			}
		}
	`);

  const [room] = ast.fields as ReferenceNode[];

  expect(room.label).toBe(null);
});

// ---------------------------------------------------------------------------
// Submit events
// ---------------------------------------------------------------------------

test("parses on_submit_event as a distinct event node, not a normal field", () => {
  const ast = parseForm(`
		form {
			on_submit_event {
				disable(true, {
					when: _.age < 18
				})
				label("Submit application")
			}
		}
	`);

  expect(ast.submitEvent).toBeTruthy();
  expect(ast.submitEvent!.type).toBe("event");
  expect(ast.submitEvent!.name).toBe("on_submit_event");
  expect(ast.submitEvent!.rules.length).toBe(2);
  expect(ast.submitEvent!.rules[0].type).toBe("disable");
  expect(ast.submitEvent!.rules[0].scope).toBe("on_submit_event");
  expect(ast.submitEvent!.rules[1].args[0]).toBe("Submit application");

  // Submit event must not show up in the fields array.
  expect(ast.fields.length).toBe(0);
});

test("throws a structural error on more than one on_submit_event block", () => {
  expect(() =>
    parseForm(`
			form {
				on_submit_event { label("a") }
				on_submit_event { label("b") }
			}
		`),
  ).toThrow(DSLParseError);
});

// ---------------------------------------------------------------------------
// Dynamic rules/functions - the grammar must never hard-code rule names
// ---------------------------------------------------------------------------

test("parses arbitrary/future rule names with the same generic shape", () => {
  const ast = parseForm(`
		form {
			text foo "Foo" {
				readonly(true)
				visible(false, { when: _.x })
				validate("email")
				transform("uppercase")
				calculate(_.a + _.b)
				futureRuleNoOneHasThoughtOfYet(1, 2, 3)
			}
		}
	`);

  const rules = (ast.fields[0] as FieldNode).rules;

  expect(rules.map((r) => r.type)).toEqual([
    "readonly",
    "visible",
    "validate",
    "transform",
    "calculate",
    "futureRuleNoOneHasThoughtOfYet",
  ]);

  expect(rules[5].args).toEqual([1, 2, 3]);
  expect(rules[4].args[0]).toBe("_.a + _.b");
});

test("a rule with zero arguments parses to an empty args array", () => {
  const ast = parseForm(`form { text f "F" { touch() } }`);

  expect((ast.fields[0] as FieldNode).rules[0].args).toEqual([]);
});

// ---------------------------------------------------------------------------
// Named options object (the rule(value, { ...options }) convention)
// ---------------------------------------------------------------------------

test("parses the generic {error, when} options object without knowing what the keys mean", () => {
  const ast = parseForm(`
		form {
			text f "F" {
				required(true, {
					error: "Required",
					when: _.x === 1,
					futureOption: 42
				})
			}
		}
	`);

  const rule = (ast.fields[0] as FieldNode).rules[0];

  expect(rule.args[1]).toEqual({
    error: "Required",
    when: "_.x === 1",
    futureOption: 42,
  });
});

// ---------------------------------------------------------------------------
// Expressions
// ---------------------------------------------------------------------------

test("captures expressions as raw, unevaluated strings", () => {
  const ast = parseForm(`
		form {
			text f "F" {
				show(true, { when: _.age >= 18 })
			}
		}
	`);

  const rule = (ast.fields[0] as FieldNode).rules[0];

  expect((rule.args[1] as any).when).toBe("_.age >= 18");
});

test("expressions with logical operators, comparisons, and nested calls", () => {
  const cases: [string, string][] = [
    ["_.age >= 18 && _.verified", "_.age >= 18 && _.verified"],
    ['_.country === "US"', '_.country === "US"'],
    ["someFunction(_.age)", "someFunction(_.age)"],
    [
      '(_.age > 18 && _.country === "NG")',
      '(_.age > 18 && _.country === "NG")',
    ],
  ];

  for (const [expr, expected] of cases) {
    const ast = parseForm(
      `form { text f "F" { show(true, { when: ${expr} }) } }`,
    );

    const rule = (ast.fields[0] as FieldNode).rules[0];

    expect((rule.args[1] as any).when).toBe(expected);
  }
});

test("expression parsing does not terminate early at commas/parens nested inside it", () => {
  const ast = parseForm(`
		form {
			text f "F" {
				show(true, {
					when: someFn(_.a, _.b) && otherFn([1, 2, 3])
				})
			}
		}
	`);

  const rule = (ast.fields[0] as FieldNode).rules[0];

  expect((rule.args[1] as any).when).toBe(
    "someFn(_.a, _.b) && otherFn([1, 2, 3])",
  );
});

test("a bare expression can be a rule's primary (first) argument too", () => {
  const ast = parseForm(`form { text f "F" { calculate(_.a + _.b * 2) } }`);

  const rule = (ast.fields[0] as FieldNode).rules[0];

  expect(rule.args[0]).toBe("_.a + _.b * 2");
});

// ---------------------------------------------------------------------------
// Values: strings, numbers, booleans, null, arrays, nested objects
// ---------------------------------------------------------------------------

test("parses primitive literal values", () => {
  const ast = parseForm(`
		form {
			text f "F" {
				r1("a string")
				r2(true)
				r3(false)
				r4(null)
				r5(123)
				r6(-123)
				r7(12.5)
			}
		}
	`);

  const rules = (ast.fields[0] as FieldNode).rules;
  const r1 = rules[0].args[0];
  const r2 = rules[1].args[0];
  const r3 = rules[2].args[0];
  const r4 = rules[3].args[0];
  const r5 = rules[4].args[0];
  const r6 = rules[5].args[0];
  const r7 = rules[6].args[0];

  expect(r1).toBe("a string");
  expect(r2).toBe(true);
  expect(r3).toBe(false);
  expect(r4).toBe(null);
  expect(r5).toBe(123);
  expect(r6).toBe(-123);
  expect(r7).toBe(12.5);
});

test("parses string escape sequences", () => {
  const ast = parseForm(
    String.raw`form { text f "F" { r("line1\nline2 \"quoted\" \\ end") } }`,
  );

  const rule = (ast.fields[0] as FieldNode).rules[0];

  expect(rule.args[0]).toBe('line1\nline2 "quoted" \\ end');
});

test("parses arrays, including nested arrays", () => {
  const ast = parseForm(
    `form { text f "F" { r([1, 2, 3]) nested([1, [2, 3], 4]) } }`,
  );

  const rules = (ast.fields[0] as FieldNode).rules;

  expect(rules[0].args[0]).toEqual([1, 2, 3]);
  expect(rules[1].args[0]).toEqual([1, [2, 3], 4]);
});

test("parses nested objects inside a value", () => {
  const ast = parseForm(`
		form {
			text f "F" {
				r({
					name: "John",
					age: 20,
					address: {
						city: "Lagos",
						zip: "100001"
					}
				})
			}
		}
	`);

  const rule = (ast.fields[0] as FieldNode).rules[0];

  expect(rule.args[0]).toEqual({
    name: "John",
    age: 20,
    address: { city: "Lagos", zip: "100001" },
  });
});

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

// test("line and block comments are allowed anywhere whitespace is allowed", () => {
// 	const ast = parseForm(`
// 		// top comment
// 		form {
// 			// metadata comment
// 			name: "F" // trailing comment
// 			/* block
// 			   comment */
// 			text f /* inline */ "Field" {
// 				// rule comment
// 				required(true) // after rule
// 				/* between rules */
// 				show(true /* inline in args */, { when: _.x /* inline */ })
// 			}
// 		}
// 	`);
// 	expect(ast.name).toBe("F");
// 	const rules = (ast.fields[0] as FieldNode).rules;
// 	expect(rules[0].type).toBe("required");
// 	expect(rules[1].type).toBe("show");
// 	expect((rules[1].args[1] as any).when).toBe("_.x");
// });

// ---------------------------------------------------------------------------
// Multiline function calls
// ---------------------------------------------------------------------------

test("function calls and objects may span multiple lines", () => {
  const ast = parseForm(`
		form {
			text age "Age" {
				required(
					true,
					{
						error: "Age is required",
						when: _.age >= 18
					}
				)
			}
		}
	`);

  const rule = (ast.fields[0] as FieldNode).rules[0];

  expect(rule.args[0]).toBe(true);
  expect(rule.args[1]).toEqual({
    error: "Age is required",
    when: "_.age >= 18",
  });
});

// ---------------------------------------------------------------------------
// Duplicate rules must be preserved, in order, never merged/overwritten
// ---------------------------------------------------------------------------

test("duplicate rules are preserved in order and not overwritten", () => {
  const ast = parseForm(`
		form {
			text age "Age" {
				required(true)
				required(true, {
					when: _.country === "NG"
				})
			}
		}
	`);

  const rules = (ast.fields[0] as FieldNode).rules;

  expect(rules.length).toBe(2);
  expect(rules[0].type).toBe("required");
  expect(rules[0].args).toEqual([true]);
  expect(rules[1].type).toBe("required");
  expect(rules[1].args).toEqual([true, { when: '_.country === "NG"' }]);
});

// ---------------------------------------------------------------------------
// Syntax errors
// ---------------------------------------------------------------------------

test("malformed DSL raises a Peggy syntax error", () => {
  expect(() => parseForm(`form { text f "F" { required(true `)).toThrow(
    DSLSyntaxError,
  );
});

// ---------------------------------------------------------------------------
// Semantic validation layer (separate from the grammar)
// ---------------------------------------------------------------------------

test("validation layer flags unknown field types, rules, options, and references, while the grammar itself accepts them", () => {
  const ast = parseForm(`
		form {
			totallyUnknownType f "F" {
				someUnknownRule(true, { madeUpOption: 1 })
			}
			reference nowhere.thing "Thing" {}
		}
	`);

  const result = validateForm(ast, {
    fieldTypes: ["text", "number"],
    rules: {
      required: {
        allowedScopes: "*",
        allowedOptions: ["error", "when"],
      },
    },
    referenceSources: ["event.room"],
  });

  expect(result.valid).toBe(false);

  const messages = result.issues.map((i) => i.message);

  expect(
    messages.some((m) => m.includes('Unknown field type "totallyUnknownType"')),
  ).toBe(true);

  expect(
    messages.some((m) => m.includes('Unknown rule "someUnknownRule"')),
  ).toBe(true);

  expect(
    messages.some((m) =>
      m.includes('Unknown reference source "nowhere.thing"'),
    ),
  ).toBe(true);
});

test("validation layer passes a well-formed form against a matching schema", () => {
  const ast = parseForm(`
		form {
			text name "Full Name" {
				required(true, { error: "Required" })
			}
			reference event.room "Event Room" {
				required(true)
			}
		}
	`);

  const result = validateForm(ast, {
    fieldTypes: ["text", "number"],
    rules: {
      required: {
        allowedScopes: "*",
        allowedOptions: ["error", "when"],
      },
    },
    referenceSources: ["event.room"],
  });

  expect(result.valid).toBe(true);
  expect(result.issues).toEqual([]);
});
