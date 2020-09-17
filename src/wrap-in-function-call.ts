import * as t from "./ast";
import { Code, Selection } from "./editor";
import { Modification, NoModification, Update } from "./modification";

export { wrapInFunctionCall };

function wrapInFunctionCall(code: Code, selection: Selection): Modification {
  let result: Modification = new NoModification();

  t.traverseCode(code, {
    Expression(path) {
      if (!t.isSelectablePath(path)) return;
      if (!selection.isInsidePath(path)) return;

      // Since we visit nodes from parent to children, first check
      // if a child would match the selection closer.
      if (hasChildWhichMatchesSelection(path, selection)) return;

      result = new WrapInFunctionCall(code, path);
    }
  });

  return result;
}

function hasChildWhichMatchesSelection(
  path: t.NodePath,
  selection: Selection
): boolean {
  let result = false;

  path.traverse({
    Expression(childPath) {
      if (!selection.isInsidePath(childPath)) return;
      if (
        t.isCallExpression(childPath.parent) &&
        childPath.parent.callee === childPath.node
      )
        return;

      result = true;
      childPath.stop();
    }
  });

  return result;
}


class WrapInFunctionCall implements Modification {
  private path: t.NodePath<t.Selectable<t.Expression>>;

  constructor(private code: Code, path: t.NodePath<t.Selectable<t.Expression>>) {
    this.path = path;
  }
  
  execute(update: Update) {
    const { node } = this.path;

    const raw = this.code.slice(node.start ?? undefined, node.end ?? undefined);

    update({
      code: `$\{1:wrapped\}(${raw})$0`,
      positionOrSelection: Selection.fromPath(this.path),
      name: `Wrap in function call`
    });
  }
}
