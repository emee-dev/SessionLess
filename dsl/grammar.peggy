{
  let staticActions = [];
}

Start
  = _ "form" _ "{" _ meta:MetaPair* fields:FieldDecl* _ "}" _ EOF {
      const form = { name: "", description: "", defaultValues: {} };
      for (const m of meta) {
        form[m.key] = m.value;
      }
      return {
        name: form.name,
        description: form.description,
        defaultValues: form.defaultValues,
        static: staticActions,
        fields: fields
      };
    }

MetaPair
  = _ key:("defaultValues" / "name" / "description") _ ":" _ value:MetaValue _ Terminator? {
      return { key, value };
    }

MetaValue
  = ObjectLiteral
  / StringLiteral

ObjectLiteral
  = "{" _ pairs:ObjectPair* _ "}" {
      const obj = {};
      for (const p of pairs) obj[p.key] = p.value;
      return obj;
    }

ObjectPair
  = _ key:Identifier _ ":" _ value:Literal _ Terminator? {
      return { key, value };
    }


// A leading `pub` keyword marks a field visible to event organizers/reviewers
// reviewing the form; every field is otherwise private by default.
FieldDecl
  = _ pub:PubModifier? type:Identifier __ id:FieldId label:(__ l:StringLiteral { return l; })? _ "{" statements:Statement* _ "}" _ {
      const actions = [];

      for (const stmt of statements) {
        if (stmt.kind === "static") {
          staticActions.push({ expr: "", action: stmt.action, target: id });
        } else {
          actions.push({ expr: stmt.expr, action: stmt.action });
        }
      }

      return {
        type,
        id,
        label: label !== null ? label : id,
        modifier: pub ? "public" : "private",
        actions
      };
    }

PubModifier
  = "pub" __ { return true; }

FieldId
  = chars:[a-zA-Z0-9_.]+ { return chars.join(""); }

Statement
  = ConditionalStatement
  / ActionStatement

ConditionalStatement
  = _ "if" __ expr:Expression __ "then" __ actions:ActionList _ Terminator? _ {
      return { kind: "conditional", expr, action: actions.map(a => a + ";").join(" ") };
    }

ActionStatement
  = _ action:Action _ Terminator? _ {
      return { kind: "static", action: action + ";" };
    }

ActionList
  = first:Action rest:(_ "," _ a:Action { return a; })* {
      return [first, ...rest];
    }

// Returns the raw, verbatim source text of a single call, e.g. show("x").
Action
  = Identifier _ "(" _ ArgList? _ ")" {
      return text().trim();
    }

ArgList
  = first:Arg rest:(_ "," _ a:Arg { return a; })* { return [first, ...rest]; }

Arg
  = Literal
  / Reference

// A bare reference token used as an action argument, e.g. _.name or
// event.room. Not used for conditions - see the Expression rule below.
Reference
  = $([a-zA-Z_][a-zA-Z0-9_.]*)


Expression
  = parts:ExpressionPart+ { return parts.join(""); }

ExpressionPart
  = QuotedStringRaw
  / !(WhiteSpace* "then" ![a-zA-Z0-9_]) c:. { return c; }

QuotedStringRaw
  = '"' DoubleStringChar* '"' { return text(); }
  / "'" SingleStringChar* "'" { return text(); }


Literal
  = BooleanLiteral
  / NumberLiteral
  / StringLiteral

BooleanLiteral
  = ("true" / "false") ![a-zA-Z0-9_] { return text() === "true"; }

NumberLiteral
  = digits:$("-"? [0-9]+ ("." [0-9]+)?) { return parseFloat(digits); }

StringLiteral
  = '"' chars:DoubleStringChar* '"' { return chars.join(""); }
  / "'" chars:SingleStringChar* "'" { return chars.join(""); }

DoubleStringChar
  = !('"' / "\\") c:. { return c; }
  / "\\" c:. { return c; }

SingleStringChar
  = !("'" / "\\") c:. { return c; }
  / "\\" c:. { return c; }

Identifier
  = $([a-zA-Z_][a-zA-Z0-9_]*)


Terminator
  = (";" / "\n")+

_ "optional whitespace"
  = (WhiteSpace / Comment)*

__ "required whitespace"
  = (WhiteSpace / Comment)+

WhiteSpace
  = [ \t\n\r]

Comment
  = "//" [^\n]*
  / "/*" (!"*/" .)* "*/"

EOF
  = !.
