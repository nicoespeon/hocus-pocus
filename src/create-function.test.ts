import { Selection, Position, Code } from "./editor";
import { determineModification } from "./modification";

// TODO: handle params
// TODO: respect indentation

it("should create function declaration from a call expression", () => {
  const code = "readCode();";
  const selection = Selection.cursorAt(0, 0);

  shouldUpdateCodeFor(code, selection, {
    code: `
function readCode() {
  // Implement
}`,
    position: new Position(1, 0)
  });
});

it("should create function declaration from a call expression assigned to a variable, cursor on call expression", () => {
  const code = "const code = readCode();";
  const selection = Selection.cursorAt(0, 13);

  shouldUpdateCodeFor(code, selection, {
    code: `
function readCode() {
  // Implement
}`,
    position: new Position(1, 0)
  });
});

it("should create function declaration from a call expression param of another call, cursor on call expression", () => {
  const code = "console.log(readCode());";
  const selection = Selection.cursorAt(0, 13);

  shouldUpdateCodeFor(code, selection, {
    code: `
function readCode() {
  // Implement
}`,
    position: new Position(1, 0)
  });
});

function shouldUpdateCodeFor(
  code: Code,
  selection: Selection,
  expected: Expected
) {
  const update = jest.fn();

  const modification = determineModification(code, selection);
  modification.execute(update);

  expect(update).toBeCalledWith(expected.code, expected.position);
}

type Expected = {
  code: Code;
  position: Position;
  // name: string;
};

it("should not update code if call expression is already declared", () => {
  const code = `readCode();

function readCode() {}`;
  const selection = Selection.cursorAt(0, 0);

  shouldNotUpdateCodeFor(code, selection);
});

it("should not update code if selection is not on call expression", () => {
  const code = `const hello = "world";
readCode();`;
  const selection = Selection.cursorAt(0, 0);

  shouldNotUpdateCodeFor(code, selection);
});

function shouldNotUpdateCodeFor(code: Code, selection: Selection) {
  const update = jest.fn();

  const modification = determineModification(code, selection);
  modification.execute(update);
}
