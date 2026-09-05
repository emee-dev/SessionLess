{{
  function buildRawArgs(first, rest) {
    return [first, ...rest.map((r) => r[3])];
  }
}}

Start
  = _ form:Form _ {
      return form;
    }

Form
  = "form" _ "{" _ items:FormItemList _ "}" _ {
      return { type: "form", items: items };
    }

FormItemList
  = first:FormItem rest:(_ FormItem)* {
      return [first, ...rest.map((r) => r[1])];
    }
  / _ {
      return [];
    }

FormItem
  = ReferenceField
  / SubmitEvent
  / NormalField
  / MetadataProperty

// ---------------------------------------------------------------------------
// Normal field:  <type> <name> "<label>" { <rules> }
// ---------------------------------------------------------------------------

NormalField
  = fieldType:Identifier _ name:Identifier _ label:StringLiteral _ "{" _ rules:RuleList _ "}" {
      return {
        kind: "field",
        fieldType: fieldType,
        name: name,
        label: label,
        rules: rules,
      };
    }

// ---------------------------------------------------------------------------
// Reference field:  reference <path.to.source> "<label>"? { <rules> }
// ---------------------------------------------------------------------------

ReferenceField
  = "reference" _ source:DottedPath _ label:StringLiteral? _ "{" _ rules:RuleList _ "}" {
      return {
        kind: "reference",
        source: source,
        label: label !== null ? label : null,
        rules: rules,
      };
    }

DottedPath
  = first:Identifier rest:("." Identifier)+ {
      return [first, ...rest.map((r) => r[1])].join(".");
    }


SubmitEvent
  = "on_submit_event" _ "{" _ rules:RuleList _ "}" {
      return {
        kind: "event",
        name: "on_submit_event",
        rules: rules,
      };
    }

// Generic metadata property:  <identifier>: <value>
// Covers `name: "..."`, `description: "..."`, `defaultValues: {...}`,

MetadataProperty
  = key:Identifier _ ":" _ value:ArgumentValue {
      return {
        kind: "metadata",
        key: key,
        value: value,
      };
    }


// Rules: generic `functionName(args)` calls. Never hard-coded.
RuleList
  = first:Rule rest:(_ Rule)* {
      return [first, ...rest.map((r) => r[1])];
    }
  / _ {
      return [];
    }

Rule
  = name:Identifier _ "(" _ args:ArgumentList? _ ")" {
      return {
        type: name,
        args: args !== null ? args : [],
      };
    }

ArgumentList
  = first:ArgumentValue rest:(_ "," _ ArgumentValue)* (_ ",")? {
      return buildRawArgs(first, rest);
    }

// An argument (or an object-property value) is either a well-formed
// JSON-like literal, or -- when it isn't -- a raw, un-evaluated expression
// string.
ArgumentValue
  = Value
  / Expression


Value
  = ObjectLiteral
  / ArrayLiteral
  / StringLiteral
  / NumberLiteral
  / BooleanLiteral
  / NullLiteral

ObjectLiteral
  = "{" _ props:PropertyList? _ "}" {
      const obj = {};
      (props || []).forEach((p) => {
        obj[p.key] = p.value;
      });
      return obj;
    }

// Properties may be separated by a comma, by whitespace/newlines, or
// both (e.g. `defaultValues` blocks use newline-separated properties
// with no commas at all, while inline option objects like
// `{ error: "...", when: ... }` use commas).
PropertyList
  = first:Property rest:(_ ","? _ Property)* (_ ",")? {
      return [first, ...rest.map((r) => r[3])];
    }

Property
  = key:PropertyKey _ ":" _ value:ArgumentValue {
      return { key: key, value: value };
    }

PropertyKey
  = Identifier
  / StringLiteral

ArrayLiteral
  = "[" _ items:ArrayItemList? _ "]" {
      return items !== null ? items : [];
    }

ArrayItemList
  = first:ArgumentValue rest:(_ "," _ ArgumentValue)* (_ ",")? {
      return buildRawArgs(first, rest);
    }

BooleanLiteral
  = "true" !IdentPart { return true; }
  / "false" !IdentPart { return false; }

NullLiteral
  = "null" !IdentPart { return null; }

NumberLiteral
  = sign:"-"? int:[0-9]+ frac:("." [0-9]+)? !IdentPart {
      const text = (sign || "") + int.join("") + (frac ? "." + frac[1].join("") : "");
      return parseFloat(text);
    }

StringLiteral
  = '"' chars:DoubleStringChar* '"' {
      return chars.join("");
    }
  / "'" chars:SingleStringChar* "'" {
      return chars.join("");
    }

DoubleStringChar
  = !('"' / "\\") c:. { return c; }
  / "\\" esc:EscapeSequence { return esc; }

SingleStringChar
  = !("'" / "\\") c:. { return c; }
  / "\\" esc:EscapeSequence { return esc; }

EscapeSequence
  = '"'  { return '"'; }
  / "'"  { return "'"; }
  / "\\" { return "\\"; }
  / "/"  { return "/"; }
  / "n"  { return "\n"; }
  / "r"  { return "\r"; }
  / "t"  { return "\t"; }
  / "b"  { return "\b"; }
  / "f"  { return "\f"; }
  / "u" digits:HexDigit4 { return String.fromCharCode(parseInt(digits, 16)); }

HexDigit4
  = a:HexDigit b:HexDigit c:HexDigit d:HexDigit { return a + b + c + d; }

HexDigit
  = [0-9a-fA-F]


// Expressions: raw, opaque, un-evaluated JS-like snippets, e.g.
//   _.age >= 18
//   _.country === "US"
//   _.age >= 18 && _.verified
//   someFunction(_.age)
//   (_.age > 18 && _.country === "NG")
//
// The grammar only knows how to find where an expression *ends*: it must
// stop at a top-level `,`, `)`, `}` or `]` that is NOT part of a nested
// group opened inside the expression itself. Nested parens/brackets/
// braces and quoted strings are consumed whole so that commas/parens
// inside them never terminate the expression early.

Expression
  = parts:ExpressionPart+ {
      return parts.join("").trim();
    }

ExpressionPart
  = ExprString
  / ExprParenGroup
  / ExprBracketGroup
  / ExprBraceGroup
  / ExprChar

ExprChar
  = !([,)}\]]) c:. { return c; }

ExprParenGroup
  = "(" inner:ExprGroupInner* ")" { return "(" + inner.join("") + ")"; }

ExprBracketGroup
  = "[" inner:ExprGroupInner* "]" { return "[" + inner.join("") + "]"; }

ExprBraceGroup
  = "{" inner:ExprGroupInner* "}" { return "{" + inner.join("") + "}"; }

ExprGroupInner
  = ExprString
  / ExprParenGroup
  / ExprBracketGroup
  / ExprBraceGroup
  / c:[^()[\]{}] { return c; }

// Raw string literal text (including quotes and escapes), preserved
// verbatim inside an expression, e.g. `_.country === "NG"`.
ExprString
  = '"' chars:('\\' . / [^"\\])* '"' {
      return '"' + chars.map((c) => (Array.isArray(c) ? c.join("") : c)).join("") + '"';
    }
  / "'" chars:('\\' . / [^'\\])* "'" {
      return "'" + chars.map((c) => (Array.isArray(c) ? c.join("") : c)).join("") + "'";
    }


Identifier
  = !ReservedWord chars:$(IdentStart IdentPart*) { return chars; }

// "reserved" only in the narrow sense that these keywords start
// structural constructs; they are still ordinary identifiers everywhere
// else (e.g. as rule names or object keys) because Identifier is only
// used where structure has already been disambiguated by context.
ReservedWord
  = ("true" / "false" / "null") !IdentPart

IdentStart
  = [a-zA-Z_$]

IdentPart
  = [a-zA-Z0-9_$]

_ "whitespace"
  = (WhiteSpace / Comment)*

WhiteSpace
  = [ \t\n\r]+

Comment
  = LineComment
  / BlockComment

LineComment
  = "//" (![\n] .)*

BlockComment
  = "/*" (!"*/" .)* "*/"
