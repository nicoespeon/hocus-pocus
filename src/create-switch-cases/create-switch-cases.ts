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

      if (Selection.fromPath(path).isOneLine) {
        result = new CreateOneLineSwitchCases(path, code, logger, selection);
      } else {
        result = new CreateSwitchCases(path, code, logger);
      }
    }
  });

  return result;
}

class CreateSwitchCases implements Modification {
  private typeChecker: TypeChecker;
  protected selection: Selection;

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

  protected get cases(): string {
    const NO_CASE = "";

    const discriminantPath = this.path.get("discriminant");
    if (!t.isSelectablePath(discriminantPath)) return NO_CASE;

    const discriminantStart = Selection.fromPath(discriminantPath).start;
    const casesToGenerate = this.typeChecker.getLiteralValuesAt(
      discriminantStart
    );

    const NO_VALUE = null;
    const existingCases = this.path.node.cases
      .map(caseNode => {
        try {
          // @ts-ignore It's not typed, so let's try/catch to be safe 🤠
          return caseNode.test.extra.raw;
        } catch {
          return NO_VALUE;
        }
      })
      .filter(value => value !== NO_VALUE);

    return casesToGenerate
      .filter(value => !existingCases.includes(value))
      .map(
        (value, index) =>
          `${this.indentation}case ${value}:\n${this.indentation +
            this.oneLevelIndentation}$${index + 1}\n`
      )
      .join("\n");
  }

  protected get indentation(): string {
    return this.switchBaseIndentation + this.oneLevelIndentation;
  }

  protected get switchBaseIndentation(): string {
    return this.INDENTATION_CHAR.repeat(this.selection.start.character);
  }

  protected get oneLevelIndentation(): string {
    return this.INDENTATION_CHAR.repeat(this.INDENTATION_WIDTH);
  }

  protected INDENTATION_CHAR = " ";
  protected INDENTATION_WIDTH = 2;

  protected get position(): Position {
    return this.selection.end.putAtStartOfLine();
  }
}

class CreateOneLineSwitchCases extends CreateSwitchCases {
  constructor(
    path: t.NodePath<t.SwitchStatement> & t.SelectablePath,
    code: Code,
    logger: Logger,
    private userSelection: Selection
  ) {
    super(path, code, logger);
  }

  protected get cases(): string {
    return `\n${super.cases}\n${this.switchBaseIndentation}`;
  }

  protected get position(): Position {
    return this.userSelection.start;
  }
}
