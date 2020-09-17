import { Position, Code, Selection } from "./editor";

export { Modification, Update, UpdateOptions };
export { NoModification };

interface Modification {
  execute(update: Update): void;
}

type Update = (options: UpdateOptions) => void;

type UpdateOptions = {
  code: Code;
  positionOrSelection: Position | Selection;
  name: string;
};

class NoModification implements Modification {
  execute() {
    // Do nothing
  }
}
