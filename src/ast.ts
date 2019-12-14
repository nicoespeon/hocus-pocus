import { parse } from "@babel/parser";
import traverse, { TraverseOptions, Scope } from "@babel/traverse";
import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

import { Code } from "./editor";

export * from "@babel/types";
export { NodePath } from "@babel/traverse";
export { Selection, Position };
export { Selectable, SelectableNode, SelectablePath };
export { isSelectablePath, isSelectableNode };
export { traverseCode };
export { isDeclared };
export { getTopLevelAncestor };

interface Selection {
  start: Position;
  end: Position;
}

interface Position {
  line: number;
  column: number;
}

type Selectable<T = t.Node> = T & { loc: t.SourceLocation };
type SelectableNode = Selectable<t.Node>;
type SelectablePath<T = t.Node> = NodePath<Selectable<T>>;

function isSelectablePath<T extends t.Node>(
  path: NodePath<T>
): path is SelectablePath<T> {
  return !!path.node.loc;
}

function isSelectableNode(node: t.Node | null): node is SelectableNode {
  return !!node && !!node.loc;
}

function traverseCode(code: Code, options: TraverseOptions) {
  traverse(
    parse(code, {
      sourceType: "module",
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      startLine: 1,
      plugins: [
        "asyncGenerators",
        "bigInt",
        "classPrivateMethods",
        "classPrivateProperties",
        "classProperties",
        "decorators-legacy",
        "doExpressions",
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "functionBind",
        "functionSent",
        "importMeta",
        "nullishCoalescingOperator",
        "numericSeparator",
        "objectRestSpread",
        "optionalCatchBinding",
        "optionalChaining",
        ["pipelineOperator", { proposal: "minimal" }],
        "throwExpressions",
        "jsx",
        "typescript"
      ]
    }),
    options
  );
}

function isDeclared(id: t.Identifier, path: NodePath): boolean {
  const bindings = path.scope.getAllBindings() as AllBindings;

  return Object.keys(bindings).reduce<boolean>((result, key) => {
    return result || bindings[key].identifier.name === id.name;
  }, false);
}

interface AllBindings {
  [key: string]: {
    identifier: t.Identifier;
    scope: Scope;
    path: NodePath;
    // The original Binding type doesn't have the `"hoisted"` kind
    // `getAllBindings()` return type is a sloppy `object`… not helpful!
    kind: "var" | "let" | "const" | "module" | "hoisted";
    referenced: boolean;
    references: number;
    referencePaths: NodePath[];
    constant: boolean;
    constantViolations: NodePath[];
  };
}

function getTopLevelAncestor(path: NodePath): SelectablePath {
  const ancestors = path
    .getAncestry()
    .filter(ancestor => !ancestor.isProgram())
    .filter(isSelectablePath);

  return ancestors[ancestors.length - 1] || path;
}
