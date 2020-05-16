export { Code, isFilled };

type Code = string;

function isFilled(code: Code | undefined): boolean {
  return !!code && code.trim() !== "";
}
