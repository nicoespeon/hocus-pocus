import { Code, Selection, Position } from "../editor";
import { Modification, NoModification, Update } from "../modification";
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
  private typeChecker: TypeChecker;

  constructor(match: Match, code: Code) {
    super(match, code);
    this.typeChecker = new TypeChecker(code);
  }

  execute(update: Update) {
    update({
      code: `\n${this.modifier}function ${this.name}(${this.args})${this.returnType} {\n  ${this.body}\n}${this.after}`,
      position: this.position,
      name: `Create function "${this.name}"`
    });
  }

  protected get args(): string {
    return this.match.node.arguments
      .map((argument, i) => {
        const name = t.isIdentifier(argument) ? argument.name : `param${i + 1}`;
        const position = t.isSelectableNode(argument)
          ? Position.fromAST(argument.loc.start)
          : new Position(0, 0);
        const type = this.typeChecker.getTypeAt(position);

        return `\${${i + 1}:${name}}: ${type}`;
      })
      .join(", ");
  }

  private get returnType(): string {
    const { parent } = this.match;

    if (t.isVariableDeclarator(parent) && t.isSelectableNode(parent)) {
      const position = Position.fromAST(parent.loc.start);
      const type = this.typeChecker.getTypeAt(position);

      return `: ${type}`;
    }

    return "";
  }
}
