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
    if (!t.isSelectablePath(this.path)) return;
    const selection = Selection.fromPath(this.path);
    const discriminantPath = this.path.get("discriminant");
    // TODO: is it OK or should it be resolved before?
    if (!t.isSelectablePath(discriminantPath)) return;

    // TODO: indentation
    // TODO: add stops in snippet
    // TODO: restrict usage so it doesn't execute if no case
    const indentation = "    ";
    const discriminantStart = Selection.fromPath(discriminantPath).start;
    const type = this.typeChecker.getLiteralValuesAt(discriminantStart);
    const cases = type.map(value => `${indentation}case ${value}:`).join("\n");

    update({
      code: `\n${cases}`,
      position: selection.end.putAtPreviousLine().putAtStartOfLine(),
      name: `Create all cases`
    });
  }
}
