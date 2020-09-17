import { Code, Selection, Position } from "../editor";
import { Modification, NoModification, Update } from "../modification";
import * as t from "../ast";
import { TypeChecker } from "../create-function-with-types/type-checker";
import { Logger, NoopLogger } from "../logger";

export { createSwitchCases };

function createSwitchCases(
  code: Code,
  selection: Selection,
  logger: Logger = new NoopLogger()
): Modification {
  let result: Modification = new NoModification();

  t.traverseCode(code, {
    SwitchStatement(path) {
      if (!selection.isInsidePath(path)) return;
      // if (t.isDeclared(path.node.callee, path)) return;

      result = new CreateSwitchCases(path, code, logger);
    }
  });

  return result;
}

class CreateSwitchCases implements Modification {
  private typeChecker: TypeChecker;

  constructor(
    private path: t.NodePath<t.SwitchStatement>,
    code: Code,
    logger: Logger
  ) {
    this.typeChecker = new TypeChecker(code, logger);
  }

  execute(update: Update) {
    const discriminantPath = this.path.get("discriminant");
    // TODO: is it OK or should it be resolved before?
    if (!t.isSelectablePath(discriminantPath)) return;

    // TODO: find correct position
    // TODO: indentation
    // TODO: add stops in snippet
    // TODO: restrict usage so it doesn't execute if no case
    const indentation = "    ";
    const selection = Selection.fromPath(discriminantPath);
    const type = this.typeChecker.getLiteralValuesAt(selection.start);
    const cases = type.map(value => `${indentation}case ${value}:`).join("\n");

    update({
      code: `\n${cases}`,
      position: new Position(4, 0),
      name: `TODO: find a name`
    });
  }
}
