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

  return new CreateFunction(match, code);
}
