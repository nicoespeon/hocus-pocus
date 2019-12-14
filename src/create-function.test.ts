import { Selection, Position } from "./editor";
import { determineModification } from "./modification";

// TODO: fix cursor position
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
  const expectedPosition = new Position(0, 10);
  expect(update).toBeCalledWith(expectedCode, expectedPosition);
});
