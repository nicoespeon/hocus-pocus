import { Position, Code } from "../editor";

export class TSPosition {
  constructor(
    private readonly code: Code,
    private readonly position: Position
  ) {}

  get value(): number {
    let result = 0;

    for (let i = 0; i < this.position.line; i++) {
      const line = this.codeLines[i];
      result += line ? line.length : 0;
    }

    if (this.position.line < this.totalLines) {
      result += this.position.character;
    }

    return result;
  }

  private get codeLines(): Code[] {
    return this.code.split("\n");
  }

  private get totalLines(): number {
    return this.codeLines.length;
  }
}
