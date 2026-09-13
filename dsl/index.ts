import { TioForm } from "@/dsl-runtime/types.js";
import { parse as pegParse } from "./generated/grammar.js";

export function parseDSL(source: string): TioForm {
  return pegParse(source);
}
