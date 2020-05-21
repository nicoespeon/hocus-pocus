import * as ts from "typescript";

import { Code, Position } from "../editor";
import { TSPosition } from "./ts-position";

export class TypeChecker {
  private fileName = "irrelevant.ts";

  constructor(private readonly code: Code) {}

  getTypeAt(position: Position): Type {
    return this.getTypeAtPosition(new TSPosition(this.code, position));
  }

  private getTypeAtPosition(position: TSPosition): Type {
    const ANY_TYPE: Type = "any";

    const program = this.createTSProgram();
    if (!program) return ANY_TYPE;

    const type = this.getTypeAtPositionWithProgram(position, program);
    if (!type) return ANY_TYPE;

    return type;
  }

  private getTypeAtPositionWithProgram(
    position: TSPosition,
    program: ts.Program
  ): Type | undefined {
    const typeChecker = program.getTypeChecker();

    try {
      // @ts-ignore Internal method
      const node = ts.getTouchingPropertyName(
        program.getSourceFile(this.fileName),
        position.value
      );
      const type = typeChecker.getTypeAtLocation(node);

      return typeChecker.typeToString(type);
    } catch (error) {
      // Since we're using internal methods, we can't rely on type checking.
      console.error("Failed to check type", {
        error,
        code: this.code,
        position: position.value
      });
      return;
    }
  }

  private createTSProgram(): ts.Program | undefined {
    const host: ts.CompilerHost = {
      ...ts.createCompilerHost({}),
      getSourceFile: (fileName, languageVersion) =>
        ts.createSourceFile(fileName, this.code, languageVersion)
    };

    return ts.createProgram([this.fileName], {}, host);
  }
}

type Type = string;
