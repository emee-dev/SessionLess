export class ExprError extends Error {
  public readonly expression: string;

  public constructor(expression: string, message: string) {
    super(`Failed to evaluate expression "${expression}": ${message}`);
    this.name = "ExprError";
    this.expression = expression;
  }
}


export class ActionParseError extends Error {
  public readonly source: string;
  public readonly position: number;

  public constructor(message: string, source: string, position: number) {
    super(`Malformed action: ${message}`);
    this.name = "ActionParseError";
    this.source = source;
    this.position = position;
  }
}
