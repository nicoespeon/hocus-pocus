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
      if (!isMatch(path.node)) return;
      if (t.isDeclared(path.node.callee, path)) return;

      match = path.node;
    }
  });

  if (!match) {
    return new NoModification();
  }

  return new CreateFunction(
    match.callee.name,
    Position.fromAST(match.loc.end)
      .putAtNextLine()
      .putAtStartOfLine()
  );
}

function isMatch(node: t.CallExpression): node is Match {
  return t.isIdentifier(node.callee);
}

type Match = t.Selectable<t.CallExpression> & { callee: t.Identifier };

class CreateFunction implements Modification {
  private name: string;
  private position: Position;

  constructor(name: string, position: Position) {
    this.name = name;
    this.position = position;
  }

  execute(update: Update) {
    update({
      code: `\nfunction ${this.name}() {\n  // Implement\n}`,
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
