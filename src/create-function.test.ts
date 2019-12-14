import { Selection, Position, Code } from "./editor";
import { determineModification, UpdateOptions } from "./modification";

// TODO: respect indentation

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

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  // Implement
}

`
    });
  });

  it("doesn't add unnecessary blank lines (1 blank line in-between)", () => {
    const code = `const code = readCode();

write(code);`;
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  // Implement
}
`
    });
  });

  it("doesn't add unnecessary blank lines (2+ blank lines in-between)", () => {
    const code = `const code = readCode();



write(code);`;
    const selection = Selection.cursorAt(0, 13);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode() {
  // Implement
}`
    });
  });

  it("with other function declarations in the code", () => {
    const code = `readCode();

function write(code) {}`;
    const selection = Selection.cursorAt(0, 0);

    shouldUpdateCodeFor(code, selection);
  });

  it("with params", () => {
    const code = `readCode(selection, "hello", 12);`;
    const selection = Selection.cursorAt(0, 0);

    shouldUpdateCodeFor(code, selection, {
      code: `
function readCode(param1, param2, param3) {
  // Implement
}`,
      name: "readCode"
    });
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
    expect(update).toBeCalledWith(expect.objectContaining(expected));
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

  expect(update).not.toBeCalled();
}
