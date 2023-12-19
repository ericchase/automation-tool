/**
 * Wrapper over `Deno.args` api.
 * @param {number} index
 * @returns {string=}
 */
export function GetArg(index) {
  return Deno.args[index] ?? undefined;
}

/**
 * Wrapper over `Deno.args` api.
 * @returns {string[]}
 */
export function GetArgs() {
  return Deno.args ?? [];
}
