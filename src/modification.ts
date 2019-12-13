import { Range, Selection, Position } from "vscode";
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

export { Modification, Update, Code };
export { determineModificationFrom };

interface Modification {
  execute(update: Update): void;
}

type Update = (code: Code, position: Position) => void;

type Code = string;

function determineModificationFrom(
  code: Code,
  selection: Range | Selection
): Modification {
  const ast = parse(code);

  let match: (t.CallExpression & { callee: t.Identifier }) | undefined;
  traverse(ast, {
    CallExpression(path) {
      const loc = nodeLoc(path.node);
      const nodeRange = new Range(
        new Position(loc.start.line - 1, loc.start.column),
        new Position(loc.end.line - 1, loc.end.column)
      );

      if (
        nodeRange.contains(selection) &&
        t.isIdentifier(path.node.callee) &&
        !hasBindings(path)
      ) {
        match = path.node as t.CallExpression & { callee: t.Identifier };
      }
    }
  });

  if (!match) {
    return new NoModification();
  }

  const loc = nodeLoc(match);
  return new CreateFunction(match.callee.name, new Position(loc.end.line, 0));
}

function hasBindings(path: NodePath) {
  return Object.keys(path.scope.getAllBindings()).length > 0;
}

class CreateFunction implements Modification {
  private name: string;
  private position: Position;

  constructor(name: string, position: Position) {
    this.name = name;
    this.position = position;
  }

  execute(update: Update) {
    // TODO: handle params
    // TODO: respect indentation
    update(`\nfunction ${this.name}() {\n  // Implement\n}`, this.position);
  }
}

class NoModification implements Modification {
  execute() {
    // Do nothing
  }
}

function nodeLoc(node: t.Node): t.SourceLocation {
  const TOP_LEFT = {
    start: { line: 0, column: 0 },
    end: { line: 0, column: 0 }
  };
  return node.loc || TOP_LEFT;
}
