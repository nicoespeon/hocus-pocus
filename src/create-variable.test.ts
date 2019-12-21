import { createVariable } from "./create-variable";
import { Selection, Position } from "./editor";
import {
  createShouldUpdateCodeFor,
  createShouldNotUpdateCodeFor
} from "./test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(createVariable);
const shouldNotUpdateCodeFor = createShouldNotUpdateCodeFor(createVariable);

it("should create variable if cursor is on an undeclared variable", () => {
  const code = "console.log(someVariable)";
  const selection = Selection.cursorAt(0, 15);

  shouldUpdateCodeFor(code, selection, {
    code: `const someVariable = $1;$0
`,
    position: new Position(0, 0),
    name: "someVariable"
  });
});

it("should create the variable just before usage", () => {
  const code = `const firstName = "John";
const lastName = "Doe";

console.log(
  someVariable
)`;
  const selection = Selection.cursorAt(4, 2);

  shouldUpdateCodeFor(code, selection, {
    position: new Position(3, 0)
  });
});

it("should respect code indentation", () => {
  const code = `function sayHello() {
  if (isMorning) {
    console.log(someVariable)
  }
}`;
  const selection = Selection.cursorAt(2, 16);

  shouldUpdateCodeFor(code, selection, {
    code: `const someVariable = $1;$0
    `,
    position: new Position(2, 4)
  });
});

it("should not create a variable if it's already declared", () => {
  const code = `const someVariable = "Hello";
console.log(someVariable)`;
  const selection = Selection.cursorAt(1, 15);

  shouldNotUpdateCodeFor(code, selection);
});
