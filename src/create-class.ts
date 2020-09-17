import { Modification, Update, NoModification } from "./modification";
import { Position, Selection, Code } from "./editor";
import * as t from "./ast";

export { createClass };

function createClass(code: Code, selection: Selection): Modification {
  let match: Match | undefined;

  t.traverseCode(code, {
    NewExpression(path) {
      if (!selection.isInsidePath(path)) return;
      if (!isMatch(path)) return;
      if (t.isDeclared(path.node.callee, path)) return;

      match = path;
    }
  });

  if (!match) {
    return new NoModification();
  }

  return new CreateClass(match, code);
}

function isMatch(path: t.NodePath<t.NewExpression>): path is Match {
  return t.isIdentifier(path.node.callee);
}

type Match = t.NodePath<
  t.Selectable<t.NewExpression> & { callee: t.Identifier }
>;

class CreateClass implements Modification {
  private match: Match;
  private code: Code;

  constructor(match: Match, code: Code) {
    this.match = match;
    this.code = code;
  }

  execute(update: Update) {
    update({
      code: `${this.before}class ${this.name} {\n  ${this.body}\n}\n\n`,
      positionOrSelection: this.position,
      name: `Create class "${this.name}"`
    });
  }

  private get name(): string {
    return this.match.node.callee.name;
  }

  private get position(): Position {
    return Selection.fromPath(
      t.closestAncestorBeforeWhichWeCanDeclareAClass(this.match)
    ).start;
  }

  private get before(): string {
    const codeBeforePosition = this.code
      .split("\n")
      .slice(0, this.position.line);

    if (!last(codeBeforePosition)) return "";
    return "\n";
  }

  private get args(): string {
    return this.match.node.arguments
      .map((argument, i) =>
        t.isIdentifier(argument) ? argument.name : `param${i + 1}`
      )
      .map((argument, i) => `\${${i + 1}:${argument}}`)
      .join(", ");
  }

  private get body(): string {
    let body = "";
    if (this.args.length > 0) {
      body = `constructor(${this.args}) {\n    \${0:// Implement}\n  }`;
    } else {
      body = `\${0:// Implement}`;
    }
    return `${body}`;
  }
}

function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}
