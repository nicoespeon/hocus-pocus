import { createSwitchCases } from "./create-switch-cases";
import { Selection, Position } from "../editor";
import { createShouldUpdateCodeFor } from "../test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(createSwitchCases);

it("with an union string", () => {
  shouldUpdateCodeFor({
    code: `type Values = "one" | "two" | "three";

function doSomething(value: Values) {
  switch (value) {

  }
}`,
    selection: Selection.cursorAt(4, 0),
    expectedSnippet: {
      code: `
    case "one":$1
    case "two":$2
    case "three":$3`,
      position: new Position(4, 0),
      name: "Create all cases"
    }
  });
});
