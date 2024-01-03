/**
 * Wrapper over Node's `process.argv` api. Note that the first 2 arguments
 * passed by Node contain the path of the executable process and the path to
 * the JavaScript file being executed. To allow for a consistent external api,
 * these first 2 arguments are skipped.
 * @param {number} index
 * @returns {string=}
 */
export function GetArg(index) {
  return process.argv[index - 2] ?? undefined;
}

/**
 * Wrapper over Node's `process.argv` api. Note that the first 2 arguments
 * passed by Node contain the path of the executable process and the path to
 * the JavaScript file being executed. To allow for a consistent external api,
 * these first 2 arguments are skipped.
 * @returns {string[]}
 */
export function GetArgs() {
  return process.argv.slice(2) ?? [];
}
