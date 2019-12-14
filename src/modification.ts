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

  private get name(): string {
    return this.match.node.callee.name;
  }

  private get position(): Position {
    return Position.fromAST(this.match.node.loc.end)
      .putAtNextLine()
      .putAtStartOfLine();
  }

  private get after(): string {
    const codeAfterPosition = this.code.split("\n").slice(this.position.line);
    const hasCodeAfterPosition = codeAfterPosition.length > 0;

    if (!hasCodeAfterPosition) return "";
    if (codeAfterPosition[0].trim() !== "") return "\n\n";
    if (codeAfterPosition[1].trim() !== "") return "\n";

    return "";
  }

  execute(update: Update) {
    update({
      code: `\nfunction ${this.name}() {\n  // Implement\n}${this.after}`,
      position: this.position,
      name: this.name
    });
  }
}

class NoModification implements Modification {
  execute() {
    // Do nothing
  }
}
