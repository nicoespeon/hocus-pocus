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

    const INDENTATION_CHAR = " ";
    const INDENTATION_WIDTH = 2;
    const indentation = INDENTATION_CHAR.repeat(
      selection.start.character + INDENTATION_WIDTH
    );

    const discriminantPath = this.path.get("discriminant");
    if (!t.isSelectablePath(discriminantPath)) return;

    // TODO: add stops in snippet
    // TODO: restrict usage so it doesn't execute if no case
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
