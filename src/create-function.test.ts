import { Selection, Position, Code } from "./editor";
import { determineModification, UpdateOptions } from "./modification";

// TODO: handle params
// TODO: respect indentation
// TODO: handle if code on line after insert

describe("create function declaration from a call expression", () => {
  it("with nothing else", () => {
    const code = "readCode();";
    const selection = Selection.cursorAt(0, 0);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  // Implement
}`,
      position: new Position(1, 0),
      name: "readCode"
    });
  });

  it("assigned to a variable", () => {
    const code = "const code = readCode();";
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection);
  });

  it("param of another call", () => {
    const code = "console.log(readCode());";
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection);
  });

  it("with assigned value referenced later", () => {
    const code = `const code = readCode();
write(code);`;
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection);
  });
});

function shouldUpdateCodeFor(
  code: Code,
  selection: Selection,
  expected?: Partial<UpdateOptions> // TODO: toto
) {
  const update = jest.fn();

  const modification = determineModification(code, selection);
  modification.execute(update);

  expect(update).toBeCalled();

  if (expected) {
    expect(update).toBeCalledWith(expected);
  }
}

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

it("should not update code if declared in a const", () => {
  const code = `const readCode = () => "hello";
readCode();`;
  const selection = Selection.cursorAt(1, 0);

  shouldNotUpdateCodeFor(code, selection);
});

function shouldNotUpdateCodeFor(code: Code, selection: Selection) {
  const update = jest.fn();

  const modification = determineModification(code, selection);
  modification.execute(update);
}
