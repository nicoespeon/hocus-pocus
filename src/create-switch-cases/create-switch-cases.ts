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
  private selection: Selection;

  constructor(
    private path: t.NodePath<t.SwitchStatement> & t.SelectablePath,
    code: Code,
    logger: Logger
  ) {
    this.typeChecker = new TypeChecker(code, logger);
    this.selection = Selection.fromPath(path);
  }

  execute(update: Update) {
    if (this.cases.length === 0) return;

    update({
      code: this.cases,
      position: this.position,
      name: `Create all cases`
    });
  }

  private get cases(): string {
    const NO_CASE = "";

    const INDENTATION_CHAR = " ";
    const INDENTATION_WIDTH = 2;
    const indentation = INDENTATION_CHAR.repeat(
      this.selection.start.character + INDENTATION_WIDTH
    );

    const discriminantPath = this.path.get("discriminant");
    if (!t.isSelectablePath(discriminantPath)) return NO_CASE;

    const discriminantStart = Selection.fromPath(discriminantPath).start;
    const type = this.typeChecker.getLiteralValuesAt(discriminantStart);

    return type
      .map((value, index) => `${indentation}case ${value}:$${index + 1}`)
      .join("\n")
      .trimStart();
  }

  private get position(): Position {
    return this.selection.end.putAtPreviousLine().putAtStartOfLine();
  }
}
