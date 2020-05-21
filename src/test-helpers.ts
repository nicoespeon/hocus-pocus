import { Selection, Code } from "./editor";
import { Modification, UpdateOptions } from "./modification";

export { createShouldUpdateCodeFor, createShouldNotUpdateCodeFor };

function createShouldUpdateCodeFor(
  fn: (code: Code, selection: Selection) => Modification
) {
  return ({
    code,
    selection,
    expectedSnippet: expected
  }: ContextAndExpectations) => {
    const update = jest.fn();

    const modification = fn(code, selection);
    modification.execute(update);

    expect(update).toBeCalled();

    if (expected) {
      expect(update).toBeCalledWith(expect.objectContaining(expected));
    }
  };
}

function createShouldNotUpdateCodeFor(
  fn: (code: Code, selection: Selection) => Modification
) {
  return ({ code, selection }: Context) => {
    const update = jest.fn();

    const modification = fn(code, selection);
    modification.execute(update);

    expect(update).not.toBeCalled();
  };
}

type Context = {
  code: Code;
  selection: Selection;
};

type ContextAndExpectations = Context & {
  expectedSnippet?: Partial<UpdateOptions>;
};
