import * as vscode from "vscode";

const COMMAND_ID = "hocusPocus.createFunction";
const SUPPORTED_LANGUAGES = [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact"
];

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("hocusPocus.quickFix", () => {
      vscode.commands.executeCommand("editor.action.quickFix");
    })
  );

  let disposable = vscode.commands.registerCommand(COMMAND_ID, () => {
    try {
      const code = readCode();
      const selection = currentSelection();

      const modification = determineModificationFrom(code, selection);

      apply(modification);
    } catch (err) {
      vscode.window.showErrorMessage(`Something went wrong: ${err}`);
    }
  });

  context.subscriptions.push(disposable);

  SUPPORTED_LANGUAGES.forEach(language => {
    vscode.languages.registerCodeActionsProvider(
      language,
      new ActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
      }
    );
  });
}

class ActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    selection: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    let canPerformAction = false;
    const code = document.getText();

    const modification = determineModificationFrom(code, selection);
    modification.execute(() => (canPerformAction = true));

    if (!canPerformAction) return [];

    const title = "🔮 Create function";
    const action = new vscode.CodeAction(title);
    action.command = {
      command: COMMAND_ID,
      title
    };

    return [action];
  }
}

function readCode(): Code {
  const editor = getActiveEditor();
  return editor.document.getText();
}

function getActiveEditor(): vscode.TextEditor {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    throw new Error("There's no active text editor");
  }

  return editor;
}

function currentSelection(): vscode.Selection {
  const editor = getActiveEditor();
  return editor.selection;
}

// TODO: extract domain and start testing
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

function determineModificationFrom(
  code: Code,
  selection: vscode.Range | vscode.Selection
): Modification {
  const ast = parse(code);
  let match: (t.CallExpression & { callee: t.Identifier }) | undefined;
  traverse(ast, {
    CallExpression(path) {
      const loc = nodeLoc(path.node);
      const nodeRange = new vscode.Range(
        new vscode.Position(loc.start.line - 1, loc.start.column),
        new vscode.Position(loc.end.line - 1, loc.end.column)
      );

      if (
        nodeRange.contains(selection) &&
        t.isIdentifier(path.node.callee) &&
        !hasBindings(path)
      ) {
        match = path.node as t.CallExpression & { callee: t.Identifier };
      }
    }
  });

  if (!match) {
    return new NoModification();
  }

  const loc = nodeLoc(match);
  return new CreateFunction(
    match.callee.name,
    new vscode.Position(loc.end.line, 0)
  );
}

function hasBindings(path: NodePath) {
  return Object.keys(path.scope.getAllBindings()).length > 0;
}

class CreateFunction implements Modification {
  private name: string;
  private position: vscode.Position;

  constructor(name: string, position: vscode.Position) {
    this.name = name;
    this.position = position;
  }

  execute(update: Update) {
    // TODO: handle params
    // TODO: respect indentation
    update(`\nfunction ${this.name}() {\n  // Implement\n}`, this.position);
  }
}

class NoModification implements Modification {
  execute() {
    // Do nothing
  }
}

interface Modification {
  execute(update: Update): void;
}

type Update = (code: Code, position: vscode.Position) => void;

function nodeLoc(node: t.Node): t.SourceLocation {
  const TOP_LEFT = {
    start: { line: 0, column: 0 },
    end: { line: 0, column: 0 }
  };
  return node.loc || TOP_LEFT;
}

function apply(modification: Modification) {
  const editor = getActiveEditor();
  const edit = new vscode.WorkspaceEdit();

  modification.execute((code, position) =>
    edit.insert(editor.document.uri, position, code)
  );

  vscode.workspace.applyEdit(edit);
}

type Code = string;

export function deactivate() {}
