/**
 * Wrapper over Node's `process.argv` api. Note that the first 2 arguments
 * passed by Node contain the path of the executable process and the path to
 * the JavaScript file being executed. To allow for a consistent external api,
 * these first 2 arguments need to be skipped.
 * @param {number} index
 * @returns {string=}
 */
export function getArg(index) {
  return process.argv[index - 2] ?? undefined;
}
