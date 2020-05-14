import { createFunctionWithTypes } from "./create-function-with-types";
import { Selection, Position } from "../editor";
import {
  createShouldUpdateCodeFor,
  createShouldNotUpdateCodeFor
} from "../test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(createFunctionWithTypes);
const shouldNotUpdateCodeFor = createShouldNotUpdateCodeFor(
  createFunctionWithTypes
);

it("with no argument", () => {
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

it("with literal arguments", () => {
  shouldUpdateCodeFor({
    code: `readCode("hello", true);`,
    selection: Selection.cursorAt(0, 0),
    expected: {
      code: `
function readCode(\${1:param1}: "hello", \${2:param2}: true) {
  \${0:// Implement}
}`,
      position: new Position(1, 0),
      name: 'Create function "readCode"'
    }
  });
});

it("with literal arguments and let assignment", () => {
  shouldUpdateCodeFor({
    code: `let name = "John";
readCode(name);`,
    selection: Selection.cursorAt(1, 0),
    expected: {
      code: `
function readCode(\${1:name}: string) {
  \${0:// Implement}
}`,
      position: new Position(2, 0),
      name: 'Create function "readCode"'
    }
  });
});

it("should not update code if call expression is already declared", () => {
  shouldNotUpdateCodeFor({
    code: `readCode();

function readCode() {}`,
    selection: Selection.cursorAt(0, 0)
  });
});
