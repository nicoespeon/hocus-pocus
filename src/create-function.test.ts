import { Selection, Position, Code } from "./editor";
import { determineModification } from "./modification";

// TODO: handle params
// TODO: respect indentation

it("should create function declaration from a call expression", () => {
  const code = "readCode();";
  const selection = Selection.cursorAt(0, 0);
  const update = jest.fn();

  const modification = determineModification(code, selection);
  modification.execute(update);

  const expectedCode = `
function readCode() {
  // Implement
}`;
  const expectedPosition = new Position(1, 0);
  expect(update).toBeCalledWith(expectedCode, expectedPosition);
});

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
