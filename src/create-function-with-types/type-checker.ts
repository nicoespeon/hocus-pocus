import * as ts from "typescript";
import {
  createDefaultMapFromNodeModules,
  createSystem,
  createVirtualLanguageServiceHost
} from "@typescript/vfs";

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

    let type = this.getTypeAtPositionWithProgram(position, program);

    // Current implementation of TS Program can't resolve certain types
    // like `string[]`, it returns `{}` instead.
    // In this scenario, fallback on the VFS approach that seems to work.
    if (type === "{}") {
      const program = this.createTSProgramWithVirtualFileSystem();
      if (!program) return ANY_TYPE;

      type = this.getTypeAtPositionWithProgram(position, program);
    }

    return type || ANY_TYPE;
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

  private createTSProgramWithVirtualFileSystem(): ts.Program | undefined {
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
