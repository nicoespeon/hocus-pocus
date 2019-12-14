import { NodePath, isSelectablePath, SelectablePath } from "../ast";
import { Position } from "./position";

export { Selection };

class Selection {
  readonly start: Position;
  readonly end: Position;

  constructor([startLine, startChar]: number[], [endLine, endChar]: number[]) {
    this.start = new Position(startLine, startChar);
    this.end = new Position(endLine, endChar);
  }

  static fromPositions(start: Position, end: Position): Selection {
    return new Selection(
      [start.line, start.character],
      [end.line, end.character]
    );
  }

  static fromPath(path: SelectablePath): Selection {
    return Selection.fromPositions(
      Position.fromAST(path.node.loc.start),
      Position.fromAST(path.node.loc.end)
    );
  }

  static cursorAt(line: number, char: number): Selection {
    return new Selection([line, char], [line, char]);
  }

  get isMultiLines(): boolean {
    return !this.start.isSameLineThan(this.end);
  }

  get height(): number {
    return this.end.line - this.start.line;
  }

  extendToStartOfLine(): Selection {
    return Selection.fromPositions(this.start.putAtStartOfLine(), this.end);
  }

  extendToEndOfLine(): Selection {
    return Selection.fromPositions(this.start, this.end.putAtEndOfLine());
  }

  extendToStartOfNextLine(): Selection {
    return Selection.fromPositions(
      this.start,
      this.end.putAtNextLine().putAtStartOfLine()
    );
  }

  extendStartToEndOf(selection: Selection): Selection {
    return selection.end.isBefore(this.start)
      ? Selection.fromPositions(selection.end, this.end)
      : this;
  }

  extendStartToStartOf(selection: Selection): Selection {
    return selection.start.isBefore(this.start)
      ? Selection.fromPositions(selection.start, this.end)
      : this;
  }

  extendEndToStartOf(selection: Selection): Selection {
    return selection.start.isAfter(this.end)
      ? Selection.fromPositions(this.start, selection.start)
      : this;
  }

  extendEndToEndOf(selection: Selection): Selection {
    return selection.end.isAfter(this.end)
      ? Selection.fromPositions(this.start, selection.end)
      : this;
  }

  isInsidePath(path: NodePath): path is SelectablePath {
    return isSelectablePath(path) && this.isInside(Selection.fromPath(path));
  }

  contains(selection: Selection): boolean {
    return selection.isInside(this);
  }

  isInside(selection: Selection): boolean {
    return (
      this.start.isAfter(selection.start) && this.end.isBefore(selection.end)
    );
  }

  startsBefore(selection: Selection): boolean {
    return this.start.isBefore(selection.start);
  }

  isEqualTo(selection: Selection): boolean {
    return (
      this.start.isEqualTo(selection.start) && this.end.isEqualTo(selection.end)
    );
  }

  isSameLineThan(selection: Selection): boolean {
    return (
      this.start.isSameLineThan(selection.start) &&
      this.end.isSameLineThan(selection.end)
    );
  }
}
