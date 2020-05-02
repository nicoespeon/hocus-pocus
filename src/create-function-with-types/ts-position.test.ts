import { Position } from "../editor";
import { TSPosition } from "./ts-position";

const code = `const hello = "world";
console.log(hello);


// End of code snippet`;

it("should take Position character when at line 0", () => {
  const position = new Position(0, 4);

  const tsPosition = new TSPosition(code, position);

  expect(tsPosition.value).toBe(4);
});

it("should consider previous lines length when not at line 0", () => {
  const position = new Position(1, 0);

  const tsPosition = new TSPosition(code, position);

  expect(tsPosition.value).toBe(22);
});

it("should not count empty lines", () => {
  const code = `const hello = "world";



// End of code snippet`;
  const position = new Position(3, 0);

  const tsPosition = new TSPosition(code, position);

  expect(tsPosition.value).toBe(22);
});

it("should count trailing spaces", () => {
  // Use non-breakable spaces to prevent editors from trimming them
  const code = `const hello = "world";  
// End of code snippet`;
  const position = new Position(1, 0);

  const tsPosition = new TSPosition(code, position);

  expect(tsPosition.value).toBe(24);
});

it("should work if Position is outside of code range", () => {
  const code = `const hello = "world";`;
  const position = new Position(4, 5);

  const tsPosition = new TSPosition(code, position);

  expect(tsPosition.value).toBe(22);
});
