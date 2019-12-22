import * as t from "./ast";
import { Code, Selection, Position } from "./editor";
import { Modification, NoModification, Update } from "./modification";

export { createVariable };

function createVariable(code: Code, selection: Selection): Modification {
  let result: Modification = new NoModification();

  t.traverseCode(code, {
    Identifier(path) {
      if (!t.isSelectablePath(path)) return;
      if (!selection.isInsidePath(path)) return;
      if (t.isDeclared(path.node, path)) return;
      if (t.isMemberExpressionProperty(path)) return;

      result = new CreateVariable(path);
    }
  });

  return result;
}

class CreateVariable implements Modification {
  private path: t.NodePath<t.Selectable<t.Identifier>>;

  constructor(path: t.NodePath<t.Selectable<t.Identifier>>) {
    this.path = path;
  }

  execute(update: Update) {
    const { name } = this.path.node;

    update({
      code: `const ${name} = $1;$0\n`,
      position: this.position,
      name: `Create variable "${name}"`
    });
  }

  private get position(): Position {
    return Selection.fromPath(t.earliestLinkedExpression(this.path)).start;
  }
}
