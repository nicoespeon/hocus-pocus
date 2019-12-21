import { Selection, Code } from "./editor";
import { Modification, UpdateOptions } from "./modification";

export { createShouldUpdateCodeFor, createShouldNotUpdateCodeFor };

function createShouldUpdateCodeFor(
  fn: (code: Code, selection: Selection) => Modification
) {
  return (
    code: Code,
    selection: Selection,
    expectedOptions?: Partial<UpdateOptions>
  ) => {
    const update = jest.fn();

    const modification = fn(code, selection);
    modification.execute(update);

    expect(update).toBeCalled();

    if (expectedOptions) {
      expect(update).toBeCalledWith(expect.objectContaining(expectedOptions));
    }
  };
}

function createShouldNotUpdateCodeFor(
  fn: (code: Code, selection: Selection) => Modification
) {
  return (code: Code, selection: Selection) => {
    const update = jest.fn();

    const modification = fn(code, selection);
    modification.execute(update);

    expect(update).not.toBeCalled();
  };
}
