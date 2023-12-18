export class Command {
  /**
   * @param {string} name
   * @param {string[]} tokens
   * @param {Uint8Array} buffer
   */
  constructor(name, tokens, buffer) {
    this.name = name;
    this.tokens = tokens;
    this.buffer = buffer;
  }
}
