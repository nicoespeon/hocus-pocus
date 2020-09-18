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

it("should infer a generic from assignment", () => {
  const code = `const name = "John"`;
  const position = new Position(0, 6);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("string");
});

it("should override inferred type with explicit one", () => {
  const code = `const name: string = "John"`;
  const position = new Position(0, 6);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("string");
});

it("should infer generic from assignment (let)", () => {
  const code = `let name = "John"`;
  const position = new Position(0, 6);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("string");
});

it("should return the type from identifier", () => {
  const code = `let name = "John";
const firstName = name;`;
  const position = new Position(1, 19);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("string");
});

it("should infer generic from assignment (array)", () => {
  const code = `const name = ["John"]`;
  const position = new Position(0, 6);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("string[]");
});

it("should infer type literal from generic assignment with 'as const'", () => {
  const code = `const name = ["John"] as const`;
  const position = new Position(0, 6);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe(`readonly ["John"]`);
});

it("should infer type of enum", () => {
  const code = `enum Bla {
  A = 1,
  B = 2,
}

function bla() {
  doSomething(Bla.A);
}`;
  const position = new Position(6, 15);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe(`Bla`);
});

it("should infer type of a union string", () => {
  const code = `type Values = "one" | "two";

function bla(value: Values) {
  doSomething(value);
}`;
  const position = new Position(3, 15);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe(`Values`);
});

it("should return any if code is empty", () => {
  const code = ``;
  const position = new Position(0, 0);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("any");
});

it("should return any if position is outside code range", () => {
  const code = `let count: number`;
  const position = new Position(12, 30);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("any");
});

it("should return any if position is not on an identifier", () => {
  const code = `let count: number`;
  const position = new Position(0, 0);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getTypeAt(position);

  expect(type).toBe("any");
});

it("should resolve literal values of a union string", () => {
  const code = `type Values = "one" | "two";

function bla(value: Values) {
  doSomething(value);
}`;
  const position = new Position(3, 15);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getLiteralValuesAt(position);

  expect(type).toEqual([`"one"`, `"two"`]);
});

it("should resolve literal values of a nested union string", () => {
  const code = `type Values = "one" | "two" | OtherValues | "five";
type OtherValues = "three" | "four";

function bla(value: Values) {
  doSomething(value);
}`;
  const position = new Position(4, 15);
  const typeChecker = new TypeChecker(code);

  const type = typeChecker.getLiteralValuesAt(position);

  expect(type).toEqual([`"one"`, `"two"`, `"three"`, `"four"`, `"five"`]);
});

// TODO: test for mix of types in union
// TODO: test for enum
// TODO: test for mix of enums and unions mixed
