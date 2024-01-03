/**
 * Wrapper over `Deno.args` api.
 * @param {number} index
 * @returns {string=}
 */
export function GetArg(index: number): string | undefined {
  return Deno.args[index] ?? undefined;
}

/**
 * Wrapper over `Deno.args` api.
 * @returns {string[]}
 */
export function GetArgs(): string[] {
  return Deno.args ?? [];
}
