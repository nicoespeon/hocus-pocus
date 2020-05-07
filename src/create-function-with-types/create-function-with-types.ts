import { Code, Selection } from "../editor";
import { Modification, NoModification } from "../modification";
import { Match, isMatch, CreateFunction } from "../create-function";
import * as t from "../ast";

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
    return this.match.node.arguments
      .map((argument, i) =>
        t.isIdentifier(argument) ? argument.name : `param${i + 1}`
      )
      .map((argument, i) => `\${${i + 1}:${argument}}`)
      .join(", ");
  }
}
