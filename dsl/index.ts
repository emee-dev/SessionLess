import {
  SyntaxError as PeggySyntaxError,
  parse as pegParse,
} from "./generated/grammar.js";
import { FormAST, RawForm } from "./src/ast.js";
import { buildFormAST } from "./src/parser.js";

export function parseForm(source: string): FormAST {
  const raw = pegParse(source, { grammarSource: "form.dsl" }) as RawForm;
  return buildFormAST(raw);
}
