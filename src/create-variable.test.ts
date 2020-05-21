import { createVariable } from "./create-variable";
import { Selection, Position } from "./editor";
import {
  createShouldUpdateCodeFor,
  createShouldNotUpdateCodeFor
} from "./test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(createVariable);
const shouldNotUpdateCodeFor = createShouldNotUpdateCodeFor(createVariable);

it("should create variable if cursor is on an undeclared variable", () => {
  shouldUpdateCodeFor({
    code: "console.log(someVariable)",
    selection: Selection.cursorAt(0, 15),
    expectedSnippet: {
      code: "const someVariable = $1;$0\n",
      position: new Position(0, 0),
      name: 'Create variable "someVariable"'
    }
  });
});

it("should create the variable just before usage", () => {
  shouldUpdateCodeFor({
    code: `const firstName = "John";
const lastName = "Doe";

console.log(
  someVariable
)`,
    selection: Selection.cursorAt(4, 2),
    expectedSnippet: {
      position: new Position(3, 0)
    }
  });
});

it("should create the variable just before usage (variable declaration)", () => {
  shouldUpdateCodeFor({
    code: `const user = { name: firstName };`,
    selection: Selection.cursorAt(0, 23),
    expectedSnippet: {
      position: new Position(0, 0)
    }
  });
});

it("should create the variable just before usage (JSX attribute)", () => {
  shouldUpdateCodeFor({
    code: `function MyButton() {
  return <button onClick={handleClick} />
}`,
    selection: Selection.cursorAt(1, 26),
    expectedSnippet: {
      position: new Position(1, 2)
    }
  });
});

it("should respect code indentation", () => {
  shouldUpdateCodeFor({
    code: `function sayHello() {
  if (isMorning) {
    console.log(someVariable)
  }
}`,
    selection: Selection.cursorAt(2, 16),
    expectedSnippet: {
      code: "const someVariable = $1;$0\n",
      position: new Position(2, 4)
    }
  });
});

it("should not create a variable if it's already declared", () => {
  shouldNotUpdateCodeFor({
    code: `const someVariable = "Hello";
console.log(someVariable)`,
    selection: Selection.cursorAt(1, 15)
  });
});

it("should not create a variable if it's a member expression property", () => {
  shouldNotUpdateCodeFor({
    code: `console.log(someVariable)`,
    selection: Selection.cursorAt(0, 9)
  });
});
