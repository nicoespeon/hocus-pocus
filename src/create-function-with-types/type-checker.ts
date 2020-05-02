import {
  createDefaultMapFromNodeModules,
  createSystem,
  createVirtualLanguageServiceHost
} from "@typescript/vfs";
import * as ts from "typescript";

import { Code, Position } from "../editor";

export class TypeChecker {
  private fileName = "irrelevant.ts";

  constructor(private readonly code: Code) {}

  getTypeAt(position: Position): Type {
    return this.getTypeAtPosition(this.toTSPosition(position));
  }

  private toTSPosition(position: Position): TSPosition {
    return position.character;
  }

  private getTypeAtPosition(position: TSPosition): Type {
    const ANY_TYPE: Type = "any";

    const program = this.createTSProgram();
    if (!program) return ANY_TYPE;

    const typeChecker = program.getTypeChecker();

    try {
      // @ts-ignore Internal method
      const node = ts.getTouchingPropertyName(
        program.getSourceFile(this.fileName),
        position
      );
      const type = typeChecker.getTypeAtLocation(node);

      // @ts-ignore Internal method
      return typeChecker.writeType(type);
    } catch (error) {
      // Since we're using internal methods, we can't rely on type checking.
      console.error("Failed to check type", {
        error,
        code: this.code,
        position
      });
      return ANY_TYPE;
    }
  }

  private createTSProgram(): ts.Program | undefined {
    const languageServiceHost = this.createTSLanguageServiceHost();
    const languageServer = ts.createLanguageService(languageServiceHost);
    return languageServer.getProgram();
  }

  private createTSLanguageServiceHost(): ts.LanguageServiceHost {
    const tsCompilerOptions = {};

    const fsMap = createDefaultMapFromNodeModules(tsCompilerOptions);
    fsMap.set(this.fileName, this.code);

    const system = createSystem(fsMap);
    const { languageServiceHost } = createVirtualLanguageServiceHost(
      system,
      [this.fileName],
      tsCompilerOptions,
      ts
    );

    return languageServiceHost;
  }
}

type Type = string;
type TSPosition = number;
