/**
 * If `value` is not undefined and not null, call `fnThen` with `value` as
 * argument, and then return `true`. Otherwise, if `fnElse` exists, call it
 * with no argument, and then return `false`.
 *
 * Useful for narrowing value types and using within a function.
 *
 * @export
 * @template TValue
 * @param {(TValue | null | undefined)} value
 * @param {(value: TValue) => void} fnThen
 * @param {() => void} [fnElse]
 */
export function $if(value, fnThen, fnElse) {
  if (value !== null && value !== undefined) {
    fnThen(value);
    return true;
  }
  fnElse?.();
  return false;
}

/**
 * @param {*} args
 */
export function stdOut(...args) {
  console.log(...args);
}
