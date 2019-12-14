import { Position, Selection, Code } from "./editor";
import * as t from "./ast";

export { Modification, Update, UpdateOptions };
export { determineModification };

interface Modification {
  execute(update: Update): void;
}

type Update = (options: UpdateOptions) => void;

type UpdateOptions = {
  code: Code;
  position: Position;
  name: string;
};

function determineModification(code: Code, selection: Selection): Modification {
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
  private match: Match;
  private code: Code;

  constructor(match: Match, code: Code) {
    this.match = match;
    this.code = code;
  }

  execute(update: Update) {
    update({
      code: `\nfunction ${this.name}(${this.args}) {\n  ${this.body}\n}${this.after}`,
      position: this.position,
      name: this.name
    });
  }

  private get name(): string {
    return this.match.node.callee.name;
  }

  private get position(): Position {
    const ancestor = t.getTopLevelAncestor(this.match);
    return Position.fromAST(ancestor.node.loc.end)
      .putAtNextLine()
      .putAtStartOfLine();
  }

  private get after(): string {
    const codeAfterPosition = this.code.split("\n").slice(this.position.line);

    if (isEmpty(codeAfterPosition[0])) return "\n\n";
    if (isEmpty(codeAfterPosition[1])) return "\n";
    return "";
  }

  private get args(): string {
    return this.match.node.arguments
      .map((argument, i) =>
        t.isIdentifier(argument) ? argument.name : `param${i + 1}`
      )
      .join(", ");
  }

  private get body(): string {
    const isReturned = this.match.parentPath.isVariableDeclarator();
    return isReturned ? "return undefined;" : "// Implement";
  }
}

function isEmpty(code: Code | undefined): boolean {
  return !!code && code.trim() !== "";
}

class NoModification implements Modification {
  execute() {
    // Do nothing
  }
}
