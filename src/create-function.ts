import { Modification, Update, NoModification } from "./modification";
import { Position, Selection, Code, isFilled } from "./editor";
import * as t from "./ast";

export { createFunction };
export { Match, isMatch, CreateFunction };

function createFunction(code: Code, selection: Selection): Modification {
  let match: Match | undefined;

  t.traverseCode(code, {
    CallExpression(path) {
      if (!selection.isInsidePath(path)) return;
      if (!isMatch(path)) return;
      if (t.isDeclared(path.node.callee, path)) return;

      match = path;
    }
  });

  if (!match) {
    return new NoModification();
  }

  return new CreateFunction(match, code);
}

function isMatch(path: t.NodePath<t.CallExpression>): path is Match {
  return t.isIdentifier(path.node.callee);
}

type Match = t.NodePath<
  t.Selectable<t.CallExpression> & { callee: t.Identifier }
>;

class CreateFunction implements Modification {
  constructor(protected match: Match, protected code: Code) {}

  execute(update: Update) {
    update({
      code: `\n${this.modifier}function ${this.name}(${this.args}) {\n  ${this.body}\n}${this.after}`,
      positionOrSelection: this.position,
      name: `Create function "${this.name}"`
    });
  }

  protected get modifier(): string {
    if (this.match.parentPath.isAwaitExpression()) {
      return "async ";
    }
    return "";
  }

  protected get name(): string {
    return this.match.node.callee.name;
  }

  protected get position(): Position {
    const ancestor = t.topLevelAncestor(this.match);
    return Position.fromAST(ancestor.node.loc.end)
      .putAtNextLine()
      .putAtStartOfLine();
  }

  protected get after(): string {
    const codeAfterPosition = this.code.split("\n").slice(this.position.line);

    if (isFilled(codeAfterPosition[0])) return "\n\n";
    if (isFilled(codeAfterPosition[1])) return "\n";
    return "";
  }

  protected get args(): string {
    return this.match.node.arguments
      .map((argument, i) =>
        t.isIdentifier(argument) ? argument.name : `param${i + 1}`
      )
      .map((argument, i) => `\${${i + 1}:${argument}}`)
      .join(", ");
  }

  protected get body(): string {
    const parentPath = this.match.parentPath;
    const isAwait = parentPath.isAwaitExpression();
    const isReturned = isAwait
      ? parentPath.parentPath.isVariableDeclarator()
      : parentPath.isVariableDeclarator();
    const body = isReturned ? "return undefined;" : "// Implement";
    return `\${0:${body}}`;
  }
}
