import { Code, Selection, Position } from "../editor";
import { Modification, NoModification } from "../modification";
import { Match, isMatch, CreateFunction } from "../create-function";
import * as t from "../ast";
import { TypeChecker } from "./type-checker";

export { createFunctionWithTypes };

function createFunctionWithTypes(
  code: Code,
  selection: Selection
): Modification {
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

  return new CreateFunctionWithTypes(match, code);
}

class CreateFunctionWithTypes extends CreateFunction {
  protected get args(): string {
    const typeChecker = new TypeChecker(this.code);

    return this.match.node.arguments
      .map((argument, i) => {
        const name = t.isIdentifier(argument) ? argument.name : `param${i + 1}`;
        const position = t.isSelectableNode(argument)
          ? Position.fromAST(argument.loc.start)
          : new Position(0, 0);
        const type = typeChecker.getTypeAt(position);

        return `\${${i + 1}:${name}}: ${type}`;
      })
      .join(", ");
  }
}
