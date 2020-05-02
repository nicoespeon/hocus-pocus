import { TypeChecker } from "./type-checker";
import { Position } from "../editor";

it("should return the type of a typed variable", () => {
  const code = `let count: number`;
  const position = new Position(0, 5);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("number");
});

it("should return any if type can't be inferred", () => {
  const code = `let count`;
  const position = new Position(0, 5);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("any");
});

it("should return the type of a typed variable on a different line", () => {
  const code = `let count: number
let total: number
let isActive: boolean`;
  const position = new Position(2, 5);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("boolean");
});
