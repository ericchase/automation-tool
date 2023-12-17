/**
 * Wrapper over `Deno.args` api.
 * @param {number} index
 * @returns {string=}
 */
export function getArg(index) {
  return Deno.args[index] ?? undefined;
}
