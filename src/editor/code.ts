export { Code, isEmpty };

type Code = string;

function isEmpty(code: Code | undefined): boolean {
  return !!code && code.trim() !== "";
}
