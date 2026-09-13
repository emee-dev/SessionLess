import { ActionParseError } from "./errors";

export type ActionArgument = string | number | boolean | null | ActionCall;

export interface ActionCall {
  name: string;
  args: ActionArgument[];
}

class ActionParser {
  private readonly source: string;
  private position: number = 0;

  public constructor(source: string) {
    this.source = source;
  }

  public parse(): ActionCall[] {
    const actions: ActionCall[] = [];
    this.skipWhitespace();

    while (!this.isEnd()) {
      actions.push(this.parseCall());
      this.skipWhitespace();

      if (this.peek() === ";") {
        this.position += 1;
        this.skipWhitespace();
        continue;
      }

      if (!this.isEnd()) {
        this.throwError("Expected ';' between actions");
      }
    }

    return actions;
  }

  private parseCall(): ActionCall {
    const name: string = this.parseIdentifier();
    this.skipWhitespace();

    if (this.peek() !== "(") {
      this.throwError(`Expected '(' after action "${name}"`);
    }

    this.position += 1;
    const args: ActionArgument[] = this.parseArguments();

    this.skipWhitespace();

    if (this.peek() !== ")") {
      this.throwError(`Expected ')' after action "${name}"`);
    }

    this.position += 1;
    return { name, args };
  }

  private parseArguments(): ActionArgument[] {
    const args: ActionArgument[] = [];
    this.skipWhitespace();

    if (this.peek() === ")") {
      return args;
    }

    while (!this.isEnd()) {
      args.push(this.parseArgument());
      this.skipWhitespace();

      if (this.peek() === ",") {
        this.position += 1;
        this.skipWhitespace();
        continue;
      }

      if (this.peek() === ")") {
        return args;
      }

      this.throwError("Expected ',' or ')' after action argument");
    }

    this.throwError("Unexpected end of action arguments");
  }

  private parseArgument(): ActionArgument {
    this.skipWhitespace();
    const character: string | undefined = this.peek();

    if (character === '"' || character === "'") {
      return this.parseString();
    }

    if (this.isDigit(character) || character === "-") {
      return this.parseNumber();
    }

    const identifier: string = this.parseIdentifier();

    if (identifier === "true") return true;
    if (identifier === "false") return false;
    if (identifier === "null") return null;

    this.skipWhitespace();

    if (this.peek() === "(") {
      this.position -= identifier.length;
      return this.parseCall();
    }

    return identifier;
  }

  private parseString(): string {
    const quote: string | undefined = this.peek();

    if (quote !== '"' && quote !== "'") {
      this.throwError("Expected string");
    }

    this.position += 1;
    let result: string = "";

    while (!this.isEnd()) {
      const character: string | undefined = this.peek();

      if (character === quote) {
        this.position += 1;
        return result;
      }

      if (character === "\\") {
        this.position += 1;

        if (this.isEnd()) {
          this.throwError("Unterminated escape sequence");
        }

        const escaped: string | undefined = this.peek();
        const escapes: Record<string, string> = {
          n: "\n",
          r: "\r",
          t: "\t",
          "\\": "\\",
          '"': '"',
          "'": "'",
        };

        result += escapes[escaped!] ?? escaped;
        this.position += 1;
        continue;
      }

      result += character;
      this.position += 1;
    }

    this.throwError("Unterminated string");
  }

  private parseNumber(): number {
    const start: number = this.position;

    if (this.peek() === "-") {
      this.position += 1;
    }

    while (this.isDigit(this.peek())) {
      this.position += 1;
    }

    if (this.peek() === ".") {
      this.position += 1;

      while (this.isDigit(this.peek())) {
        this.position += 1;
      }
    }

    const value: number = Number(this.source.slice(start, this.position));

    if (!Number.isFinite(value)) {
      this.throwError("Invalid number");
    }

    return value;
  }

  private parseIdentifier(): string {
    this.skipWhitespace();

    const start: number = this.position;
    const first: string | undefined = this.peek();

    if (!first || !/[A-Za-z_$]/.test(first)) {
      this.throwError("Expected identifier");
    }

    this.position += 1;

    while (!this.isEnd()) {
      const character: string | undefined = this.peek();

      if (!character || !/[A-Za-z0-9_$.-]/.test(character)) {
        break;
      }

      this.position += 1;
    }

    return this.source.slice(start, this.position);
  }

  private skipWhitespace(): void {
    while (!this.isEnd() && /\s/.test(this.peek()!)) {
      this.position += 1;
    }
  }

  private peek(): string | undefined {
    return this.source[this.position];
  }

  private isEnd(): boolean {
    return this.position >= this.source.length;
  }

  private isDigit(value: string | undefined): boolean {
    return Boolean(value && /[0-9]/.test(value));
  }

  private throwError(message: string): never {
    throw new ActionParseError(
      `${message} at position ${this.position}`,
      this.source,
      this.position,
    );
  }
}

export function parseActions(source: string): ActionCall[] {
  return new ActionParser(source).parse();
}

export function numberArgument(
  value: ActionArgument | undefined,
  action: string,
): number {
  if (typeof value !== "number") {
    throw new Error(`${action} expects a number`);
  }
  return value;
}

export function booleanArgument(
  value: ActionArgument | undefined,
  action: string,
): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${action} expects a boolean`);
  }
  return value;
}

export function stringArgument(
  value: ActionArgument | undefined,
  action: string,
): string {
  if (typeof value !== "string") {
    throw new Error(`${action} expects a string`);
  }
  return value;
}


