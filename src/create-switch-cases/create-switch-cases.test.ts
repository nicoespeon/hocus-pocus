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
    case "one":
    case "two":
    case "three":`,
      position: new Position(4, 0),
      name: "TODO: find a name"
    }
  });
});
