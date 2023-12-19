export class Command {
  /**
   * @param {string} name - lowercase, one word
   * @param {string[]} tokens
   * @param {Uint8Array} buffer
   */
  constructor(name, tokens, buffer) {
    this.name = name.toLowerCase();
    this.tokens = tokens;
    this.buffer = buffer;
  }
}

/** @param {Command} command */
export function notImplemented(command) {
  throw new Error(`Command "${command.name}" not implemented.`);
}
