import { createSwitchCases } from "./create-switch-cases";
import { Selection, Position } from "../editor";
import {
  createShouldUpdateCodeFor,
  createShouldNotUpdateCodeFor
} from "../test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(createSwitchCases);
const shouldNotUpdateCodeFor = createShouldNotUpdateCodeFor(createSwitchCases);

it("with an union string", () => {
  shouldUpdateCodeFor({
    code: `type Values = "one" | "two" | "three";

function doSomething(value: Values) {
  switch (value) {

  }
}`,
    selection: Selection.cursorAt(4, 0),
    expectedSnippet: {
      code: `    case "one":
      $1

    case "two":
      $2

    case "three":
      $3
`,
      position: new Position(5, 0),
      name: "Create all cases"
    }
  });
});

it("with an enum", () => {
  shouldUpdateCodeFor({
    code: `enum Values {
  One = "one",
  Two = "two",
  Three = "three"
}

function doSomething(value: Values) {
  switch (value) {

  }
}`,
    selection: Selection.cursorAt(8, 0),
    expectedSnippet: {
      code: `    case Values.One:
      $1

    case Values.Two:
      $2

    case Values.Three:
      $3
`,
      position: new Position(9, 0),
      name: "Create all cases"
    }
  });
});

it("with an one-line switch", () => {
  shouldUpdateCodeFor({
    code: `type Values = "one" | "two" | "three";

function doSomething(value: Values) {
  switch (value) {}
}`,
    selection: Selection.cursorAt(3, 18),
    expectedSnippet: {
      code: `
    case "one":
      $1

    case "two":
      $2

    case "three":
      $3

  `,
      position: new Position(3, 18),
      name: "Create all cases"
    }
  });
});

it("with existing cases (union type)", () => {
  shouldUpdateCodeFor({
    code: `type Values = "one" | "two" | "three";

function doSomething(value: Values) {
  switch (value) {
    case "one":
      doSomething();
      break;

    case "three":
      break;
  }
}`,
    selection: Selection.cursorAt(4, 0),
    expectedSnippet: {
      code: `    case "two":
      $1
`,
      position: new Position(10, 0),
      name: "Create all cases"
    }
  });
});

it("with existing cases (enum)", () => {
  shouldUpdateCodeFor({
    code: `enum Values {
  One,
  Two,
  Three
}

function doSomething(value: Values) {
  switch (value) {
    case Values.One:
      doSomething();
      break;

    case Values.Three:
      break;
  }
}`,
    selection: Selection.cursorAt(10, 0),
    expectedSnippet: {
      code: `    case Values.Two:
      $1
`,
      position: new Position(14, 0),
      name: "Create all cases"
    }
  });
});

it("with inferred union type", () => {
  shouldUpdateCodeFor({
    code: `type Actions =
  | { type: "listTokens"; payload: { page: number } }
  | { type: "renameToken"; payload: {} & { id: string } }
  | { type: "removeToken"; payload: {} }
  | { type: "createToken" };

function doSomething(action: Actions) {
  switch (action.type) {

  }
}`,
    selection: Selection.cursorAt(8, 0),
    expectedSnippet: {
      code: `    case "listTokens":
      $1

    case "renameToken":
      $2

    case "removeToken":
      $3

    case "createToken":
      $4
`,
      position: new Position(9, 0),
      name: "Create all cases"
    }
  });
});

it("with an any", () => {
  shouldNotUpdateCodeFor({
    code: `function doSomething(value: any) {
  switch (value) {

  }
}`,
    selection: Selection.cursorAt(2, 0)
  });
});
