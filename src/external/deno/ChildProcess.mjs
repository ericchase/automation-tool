/**
 * @param {string} filepath
 * @param {string[]} args
 */
export async function Run(filepath, args) {
  const child = new Deno.Command(filepath, { args });
  await child.spawn();
  await child.output();
}
