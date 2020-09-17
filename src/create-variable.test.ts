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
      positionOrSelection: new Position(0, 0),
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
      positionOrSelection: new Position(3, 0)
    }
  });
});

it("should create the variable just before usage (variable declaration)", () => {
  shouldUpdateCodeFor({
    code: `const user = { name: firstName };`,
    selection: Selection.cursorAt(0, 23),
    expectedSnippet: {
      positionOrSelection: new Position(0, 0)
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
      positionOrSelection: new Position(1, 2)
    }
  });
});

it("should create the variable just before usage (if condition)", () => {
  shouldUpdateCodeFor({
    code: `function test(n) {
  if (n > max) {
    // ...
  }
}`,
    selection: Selection.cursorAt(1, 10),
    expectedSnippet: {
      positionOrSelection: new Position(1, 2)
    }
  });
});

it("should create the variable just before usage (while statement)", () => {
  shouldUpdateCodeFor({
    code: `function test(n) {
  while (n > max) {
    // ...
  }
}`,
    selection: Selection.cursorAt(1, 13),
    expectedSnippet: {
      positionOrSelection: new Position(1, 2)
    }
  });
});

it("should create the variable just before usage (for…of statement)", () => {
  shouldUpdateCodeFor({
    code: `function test() {
  for (let item of items) {
    // ...
  }
}`,
    selection: Selection.cursorAt(1, 19),
    expectedSnippet: {
      positionOrSelection: new Position(1, 2)
    }
  });
});

it("should create the variable just before usage (for…in statement)", () => {
  shouldUpdateCodeFor({
    code: `function test() {
  for (let item in items) {
    // ...
  }
}`,
    selection: Selection.cursorAt(1, 19),
    expectedSnippet: {
      positionOrSelection: new Position(1, 2)
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
      positionOrSelection: new Position(2, 4)
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
