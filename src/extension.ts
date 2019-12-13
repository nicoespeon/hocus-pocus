import * as vscode from "vscode";

import { Modification, Code, determineModificationFrom } from "./modification";

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

export function deactivate() {}

class ActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    selection: vscode.Range | vscode.Selection,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    let canPerformAction = false;
    const code = document.getText();

    try {
      const modification = determineModificationFrom(code, selection);
      modification.execute(() => (canPerformAction = true));
    } catch (_) {
      // Silently fail (typically, code can't be parsed)
    }

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

function apply(modification: Modification) {
  const editor = getActiveEditor();
  const edit = new vscode.WorkspaceEdit();

  modification.execute((code, position) =>
    edit.insert(editor.document.uri, position, code)
  );

  vscode.workspace.applyEdit(edit);
}
