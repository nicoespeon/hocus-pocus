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
    const node = this.getNodeAtPosition(position, program);
    if (!node) return;

    const typeChecker = program.getTypeChecker();

    try {
      const type = typeChecker.getTypeAtLocation(node);
      return this.normalizeType(typeChecker.typeToString(type));
    } catch (error) {
      this.logger.error("Failed to get type", {
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
    const program = this.createTSProgram();
    if (!program) return [];

    return this.getLiteralValuesAtPositionWithProgram(
      new TSPosition(this.code, position),
      program
    );
  }

  private getLiteralValuesAtPositionWithProgram(
    position: TSPosition,
    program: ts.Program
  ): LiteralValue[] {
    const NO_VALUE: LiteralValue[] = [];

    const node = this.getNodeAtPosition(position, program);
    if (!node) return NO_VALUE;

    const typeChecker = program.getTypeChecker();

    try {
      return this.resolveLiteralValues(
        node => this.getFirstDeclaration(typeChecker, node),
        node,
        []
      );
    } catch (error) {
      this.logger.error("Failed to retrieve literal type", {
        error,
        code: this.code,
        position: position.value
      });

      return NO_VALUE;
    }
  }

  private getFirstDeclaration(
    typeChecker: ts.TypeChecker,
    node: ts.Node
  ): ts.Declaration | undefined {
    return typeChecker.getTypeAtLocation(node).aliasSymbol?.declarations[0];
  }

  private resolveLiteralValues(
    getFirstDeclaration: (node: ts.Node) => ts.Declaration | undefined,
    node: ts.Node,
    values: LiteralValue[]
  ): LiteralValue[] {
    const is_literal = node.kind === 187;
    const is_identifier = node.kind === 75;
    const is_enum_body = node.kind === 323 && node.parent.kind === 248;
    const parent_is_type_declaration = [247, 248].includes(node.parent.kind);

    if (is_literal) return values.concat(node.getText());

    if (is_enum_body) {
      const [, enumName] =
        node.parent.getFullText().match(/^enum (\w+) /) || [];
      if (!enumName) return values;

      return values.concat(
        node
          .getFullText()
          .split(",")
          .map(text => text.split("=")[0].trim())
          .map(enumValue => `${enumName}.${enumValue}`)
      );
    }

    if (is_identifier && !parent_is_type_declaration) {
      const firstDeclaration = getFirstDeclaration(node);
      if (!firstDeclaration) return values;

      return this.resolveLiteralValues(
        getFirstDeclaration,
        firstDeclaration,
        values
      );
    }

    if (node.getChildCount() > 0) {
      return values.concat(
        ...node
          .getChildren()
          .map(child =>
            this.resolveLiteralValues(getFirstDeclaration, child, values)
          )
      );
    }

    return values;
  }

  private getNodeAtPosition(
    position: TSPosition,
    program: ts.Program
  ): ts.Node | undefined {
    try {
      // @ts-expect-error Internal method
      return ts.getTouchingPropertyName(
        program.getSourceFile(this.fileName),
        position.value
      );
    } catch (error) {
      // Since we're using internal methods, we can't rely on type checking.
      this.logger.error("Failed to get TS node", {
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
type LiteralValue = string;
