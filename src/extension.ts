import * as vscode from "vscode";

import { createFunction } from "./create-function";
import { createVariable } from "./create-variable";
import { Position, Selection, Code } from "./editor";
import { Modification } from "./modification";

const COMMANDS = [
  {
    id: "hocusPocus.createFunction",
    run: createFunction
  },
  {
    id: "hocusPocus.createVariable",
    run: createVariable
  }
];
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

  COMMANDS.forEach(({ id, run }) => {
    let disposable = vscode.commands.registerCommand(id, () => {
      try {
        const modification = run(readCode(), currentSelection());
        apply(modification);
      } catch (err) {
        vscode.window.showErrorMessage(`Something went wrong: ${err}`);
      }
    });

    context.subscriptions.push(disposable);
  });

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
    const code = document.getText();
    const selection = fromVSCodeSelectionOrRange(selectionOrRange);

    return COMMANDS.map(({ id, run }) => {
      let modificationName = null;

      try {
        const modification = run(code, selection);
        modification.execute(({ name }) => (modificationName = name));
      } catch (_) {
        // Silently fail (typically, code can't be parsed)
      }

      if (modificationName === null) return null;

      const title = `🔮 ${modificationName}`;
      const action = new vscode.CodeAction(title);
      action.command = {
        command: id,
        title
      };

      return action;
    }).filter(notNull);
  }
}

function notNull<T>(item: T | null): item is T {
  return item !== null;
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

  modification.execute(({ code, position }) => {
    const snippet = new vscode.SnippetString(code);
    return editor.insertSnippet(snippet, toVSCodePosition(position));
  });

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
