import * as vscode from "vscode";

import { Position, Selection, Code } from "./editor";
import { Modification, determineModification } from "./modification";

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
      const modification = determineModification(
        readCode(),
        currentSelection()
      );
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
    selectionOrRange: vscode.Range | vscode.Selection,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    let modificationName = null;
    const code = document.getText();
    const selection = fromVSCodeSelectionOrRange(selectionOrRange);

    try {
      const modification = determineModification(code, selection);
      modification.execute(({ name }) => (modificationName = name));
    } catch (_) {
      // Silently fail (typically, code can't be parsed)
    }

    if (modificationName === null) return [];

    const title = `🔮 Create function "${modificationName}"`;
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

function currentSelection(): Selection {
  const editor = getActiveEditor();
  return fromVSCodeSelectionOrRange(editor.selection);
}

function apply(modification: Modification) {
  const editor = getActiveEditor();
  const edit = new vscode.WorkspaceEdit();

  modification.execute(({ code, position }) =>
    edit.insert(editor.document.uri, toVSCodePosition(position), code)
  );

  vscode.workspace.applyEdit(edit);
}

function fromVSCodeSelectionOrRange(
  selection: vscode.Selection | vscode.Range
): Selection {
  return new Selection(
    [selection.start.line, selection.start.character],
    [selection.end.line, selection.end.character]
  );
}

function toVSCodePosition(position: Position): vscode.Position {
  return new vscode.Position(position.line, position.character);
}
