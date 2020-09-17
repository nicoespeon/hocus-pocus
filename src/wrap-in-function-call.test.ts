import { wrapInFunctionCall } from "./wrap-in-function-call";
import { Selection } from "./editor";
import { createShouldUpdateCodeFor } from "./test-helpers";

const shouldUpdateCodeFor = createShouldUpdateCodeFor(wrapInFunctionCall);

it("should wrap in function call", () => {
  shouldUpdateCodeFor({
    code: "const a = \"foo\";",
    selection: Selection.cursorAt(0, 10),
    expectedSnippet: {
      code: "${1:wrapped}(\"foo\")$0",
      positionOrSelection: new Selection([0, 10], [0, 15]),
      name: 'Wrap in function call'
    }
  });
});