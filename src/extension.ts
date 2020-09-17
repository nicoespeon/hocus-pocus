import * as vscode from "vscode";

import { createFunction } from "./create-function";
import { createFunctionWithTypes } from "./create-function-with-types";
import { createVariable } from "./create-variable";
import { createClass } from "./create-class";
import { Position, Selection, Code } from "./editor";
import { Modification } from "./modification";

const JS_LANGUAGES = ["javascript", "javascriptreact"];
const TS_LANGUAGES = ["typescript", "typescriptreact"];
const ALL_LANGUAGES = [...JS_LANGUAGES, ...TS_LANGUAGES];
const COMMANDS = [
  {
    id: "hocusPocus.createFunction",
    run: createFunction,
    languages: JS_LANGUAGES
  },
  {
    id: "hocusPocus.createFunctionWithTypes",
    run: createFunctionWithTypes,
    languages: TS_LANGUAGES
  },
  {
    id: "hocusPocus.createVariable",
    run: createVariable,
    languages: ALL_LANGUAGES
  },
  {
    id: "hocusPocus.createClass",
    run: createClass,
    languages: ALL_LANGUAGES
  }
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

  ALL_LANGUAGES.forEach(language => {
    vscode.languages.registerCodeActionsProvider(
      language,
      new ActionProvider(language),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
      }
    );
  });
}

export function deactivate() {}

class ActionProvider implements vscode.CodeActionProvider {
  constructor(private readonly language: string) {}

  provideCodeActions(
    document: vscode.TextDocument,
    selectionOrRange: vscode.Range | vscode.Selection,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const code = document.getText();
    const selection = fromVSCodeSelectionOrRange(selectionOrRange);

    return COMMANDS.filter(({ languages }) => languages.includes(this.language))
      .map(({ id, run }) => {
        let modificationName = null;

        try {
          const modification = run(code, selection);
          modification.execute(({ name }) => (modificationName = name));
        } catch {
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
      })
      .filter(notNull);
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

  modification.execute(({ code, positionOrSelection }) => {
    const snippet = new vscode.SnippetString(code);
    return editor.insertSnippet(
      snippet,
      positionOrSelection instanceof Position
        ? toVSCodePosition(positionOrSelection)
        : toVSCodeRange(positionOrSelection)
    );
  });

  vscode.workspace.applyEdit(edit);
}

function toVSCodeRange(selection: Selection): vscode.Range {
  return new vscode.Range(
    toVSCodePosition(selection.start),
    toVSCodePosition(selection.end)
  );
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
