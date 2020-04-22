import { createFunction } from "./create-function";
import { Selection, Position } from "./editor";
import {
  createShouldUpdateCodeFor,
  createShouldNotUpdateCodeFor
} from "./test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(createFunction);
const shouldNotUpdateCodeFor = createShouldNotUpdateCodeFor(createFunction);

describe("create function declaration from a call expression", () => {
  it("with nothing else", () => {
    shouldUpdateCodeFor({
      code: "readCode();",
      selection: Selection.cursorAt(0, 0),
      expected: {
        code: `
function readCode() {
  \${0:// Implement}
}`,
        position: new Position(1, 0),
        name: 'Create function "readCode"'
      }
    });
  });

  it("assigned to a variable", () => {
    shouldUpdateCodeFor({
      code: "const code = readCode();",
      selection: Selection.cursorAt(0, 13),
      expected: {
        code: `
function readCode() {
  \${0:return undefined;}
}`
      }
    });
  });

  it("assignment called with await", () => {
    shouldUpdateCodeFor({
      code:
        "async function doSomethingAsync() { const code = await readCode(); }",
      selection: Selection.cursorAt(0, 60),
      expected: {
        code: `
async function readCode() {
  \${0:return undefined;}
}`
      }
    });
  });

  it("await without assignment", () => {
    shouldUpdateCodeFor({
      code: "async function doSomethingAsync() { await readCode(); }",
      selection: Selection.cursorAt(0, 45),
      expected: {
        code: `
async function readCode() {
  \${0:// Implement}
}`
      }
    });
  });

  it("param of another call", () => {
    shouldUpdateCodeFor({
      code: "console.log(readCode());",
      selection: Selection.cursorAt(0, 13)
    });
  });

  it("with assigned value referenced later", () => {
    shouldUpdateCodeFor({
      code: `const code = readCode();
write(code);`,
      selection: Selection.cursorAt(0, 13),
      expected: {
        code: `
function readCode() {
  \${0:return undefined;}
}

`
      }
    });
  });

  it("doesn't add unnecessary blank lines (1 blank line in-between)", () => {
    shouldUpdateCodeFor({
      code: `const code = readCode();

write(code);`,
      selection: Selection.cursorAt(0, 13),
      expected: {
        code: `
function readCode() {
  \${0:return undefined;}
}
`
      }
    });
  });

  it("doesn't add unnecessary blank lines (2+ blank lines in-between)", () => {
    shouldUpdateCodeFor({
      code: `const code = readCode();



write(code);`,
      selection: Selection.cursorAt(0, 13),
      expected: {
        code: `
function readCode() {
  \${0:return undefined;}
}`
      }
    });
  });

  it("with other function declarations in the code", () => {
    shouldUpdateCodeFor({
      code: `readCode();

function write(code) {}`,
      selection: Selection.cursorAt(0, 0)
    });
  });

  it("with params", () => {
    shouldUpdateCodeFor({
      code: `readCode(selection, "hello", 12);`,
      selection: Selection.cursorAt(0, 0),
      expected: {
        code: `
function readCode(\${1:selection}, \${2:param2}, \${3:param3}) {
  \${0:// Implement}
}`,
        name: 'Create function "readCode"'
      }
    });
  });

  it("nested in expression statements", () => {
    shouldUpdateCodeFor({
      code: `it("should read code", () => {
  const code = readCode();

  expect(code).toBe("hello");
});
`,
      selection: Selection.cursorAt(1, 15),
      expected: {
        code: `
function readCode() {
  \${0:return undefined;}
}`,
        position: new Position(5, 0)
      }
    });
  });
});

it("should not update code if call expression is already declared", () => {
  shouldNotUpdateCodeFor({
    code: `readCode();

function readCode() {}`,
    selection: Selection.cursorAt(0, 0)
  });
});

it("should not update code if selection is not on call expression", () => {
  shouldNotUpdateCodeFor({
    code: `const hello = "world";
readCode();`,
    selection: Selection.cursorAt(0, 0)
  });
});

it("should not update code if declared in a const", () => {
  shouldNotUpdateCodeFor({
    code: `const readCode = () => "hello";
readCode();`,
    selection: Selection.cursorAt(1, 0)
  });
});
