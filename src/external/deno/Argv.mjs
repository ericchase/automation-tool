/**
 * Wrapper over `Deno.args` api.
 * @param {number} index
 * @returns {string=}
 */
export function getArg(index) {
  return Deno.args[index] ?? undefined;
}

/**
 * Wrapper over `Deno.args` api.
 * @returns {string[]}
 */
export function getArgs() {
  return Deno.args ?? [];
}
