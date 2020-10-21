import { createArrowFunctionWithTypes } from "./create-arrow-function-with-types";
import { Selection, Position } from "../editor";
import {
  createShouldUpdateCodeFor,
  createShouldNotUpdateCodeFor
} from "../test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(
  createArrowFunctionWithTypes
);
const shouldNotUpdateCodeFor = createShouldNotUpdateCodeFor(
  createArrowFunctionWithTypes
);

it("with no argument", () => {
  shouldUpdateCodeFor({
    code: "readCode();",
    selection: Selection.cursorAt(0, 0),
    expectedSnippet: {
      code: `
const readCode = () => {
  \${0:// Implement}
}`,
      position: new Position(1, 0),
      name: 'Create arrow function "readCode"'
    }
  });
});

it("with literal arguments", () => {
  shouldUpdateCodeFor({
    code: `readCode("hello", true);`,
    selection: Selection.cursorAt(0, 0),
    expectedSnippet: {
      code: `
const readCode = (\${1:param1}: string, \${2:param2}: boolean) => {
  \${0:// Implement}
}`,
      position: new Position(1, 0),
      name: 'Create arrow function "readCode"'
    }
  });
});

it("with literal arguments and let assignment", () => {
  shouldUpdateCodeFor({
    code: `let name = "John";
readCode(name);`,
    selection: Selection.cursorAt(1, 0),
    expectedSnippet: {
      code: `
const readCode = (\${1:name}: string) => {
  \${0:// Implement}
}`,
      position: new Position(2, 0),
      name: 'Create arrow function "readCode"'
    }
  });
});

it("with a return value", () => {
  shouldUpdateCodeFor({
    code: `let name = "John";
const result: string = readCode(name);`,
    selection: Selection.cursorAt(1, 23),
    expectedSnippet: {
      code: `
const readCode = (\${1:name}: string): string => {
  \${0:return undefined;}
}`,
      position: new Position(2, 0),
      name: 'Create arrow function "readCode"'
    }
  });
});

it("should not update code if call expression is already declared", () => {
  shouldNotUpdateCodeFor({
    code: `readCode();

const readCode = () => {}`,
    selection: Selection.cursorAt(0, 0)
  });
});
