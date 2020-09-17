import * as ts from "typescript";
import {
  createDefaultMapFromNodeModules,
  createSystem,
  createVirtualLanguageServiceHost
} from "@typescript/vfs";

import { Code, Position } from "../editor";
import { TSPosition } from "./ts-position";
import { Logger, NoopLogger } from "../logger";

export class TypeChecker {
  private fileName = "irrelevant.ts";
  private UNRESOLVED_TYPE = "{}";

  constructor(
    private readonly code: Code,
    private logger: Logger = new NoopLogger()
  ) {}

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
    if (type === this.UNRESOLVED_TYPE) {
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

      return this.normalizeType(typeChecker.typeToString(type));
    } catch (error) {
      // Since we're using internal methods, we can't rely on type checking.
      this.logger.error("Failed to check type", {
        error,
        code: this.code,
        position: position.value
      });
    }
  }

  private normalizeType(type: Type): Type {
    if (type === this.UNRESOLVED_TYPE) return type;

    type = type.replace("typeof ", "");

    try {
      /**
       * When inferred type is a narrow type literal, we get the generic type.
       *
       * The type literal is more accurate, but in practice we generate code
       * from one example. We usually want to generalize to the generic type.
       *
       * E.g. `functionToCreate("Oops, something went wrong");`
       *      => `functionToCreate(message: string)`
       */
      return typeof eval(type);
    } catch {
      // `type` couldn't be evaluated, fallback on its value.
    }

    return type;
  }

  getLiteralValuesAt(position: Position): string[] {
    // TODO: use similar logic to create program than to get the type
    const program = this.createTSProgram();
    if (!program) return [];

    return this.getLiteralValuesAtPositionWithProgram(
      new TSPosition(this.code, position),
      program
    );
  }

  // TODO: refactor duplication with getTypeAtPosition()
  private getLiteralValuesAtPositionWithProgram(
    position: TSPosition,
    program: ts.Program
  ): LiteralValue[] {
    const typeChecker = program.getTypeChecker();

    try {
      // @ts-ignore Internal method
      const node = ts.getTouchingPropertyName(
        program.getSourceFile(this.fileName),
        position.value
      );
      const type = typeChecker.getTypeAtLocation(node);

      return (
        type.aliasSymbol?.declarations[0]
          .getText()
          // type Values = "one" | "two";
          .replace(";", "")
          // type Values = "one" | "two"
          .split("=")[1]
          // ` "one" | "two"`
          .split("|")
          // [` "one" `, ` "two"`]
          .map(value => value.trim()) || []
      );
    } catch (error) {
      // Since we're using internal methods, we can't rely on type checking.
      this.logger.error("Failed to retrieve base type", {
        error,
        code: this.code,
        position: position.value
      });

      return [];
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
type LiteralValue = string;
