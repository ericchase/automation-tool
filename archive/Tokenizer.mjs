import { LineBuffer } from './lib/LineBuffer.mjs';
import { Reader } from './lib/Reader.mjs';

export class Tokenizer {
  /**
   * @param {Reader} reader
   */
  constructor(reader) {
    this.#lineBuffer = new LineBuffer(reader);
  }

  /**
   * Returns the next line of tokens along with the current line's buffer.
   * @this {Tokenizer}
   * @returns {[Uint8Array[], Uint8Array]} [Tokens, Buffer]
   */
  nextLine() {
    /** @type {Uint8Array[]} */
    const tokens = [];
    const buffer = this.#lineBuffer.next();
    let [begin, end] = [0, buffer.byteLength];
    let null_count = 0;
    for (let i = 0; i < end; i += 1) {
      switch (buffer[i]) {
        case 0x09: // TAB
        case 0x0a: // LF
        case 0x20: // Space
          if (i - begin - null_count > 0) {
            tokens.push(Tokenizer.ExtractNonNullBytes(buffer, begin, i, null_count));
            null_count = 0;
          }
          begin = i + 1;
          continue;
      }
      if ((buffer[i] >= 0x00 && buffer[i] <= 0x1f) || buffer[i] === 0x7f) {
        buffer[i] = 0x00;
        null_count += 1;
      }
    }
    if (end - begin - null_count > 0) {
      tokens.push(Tokenizer.ExtractNonNullBytes(buffer, begin, end, null_count));
      null_count = 0;
    }
    return [tokens, buffer];
  }

  /**
   * Extracts all bytes that are not null characters (0x00).
   * @param {Uint8Array} buffer
   * @param {number} begin
   * @param {number} end
   * @param {number} null_count
   * @returns {Uint8Array}
   */
  static ExtractNonNullBytes(buffer, begin, end, null_count) {
    const u8 = new Uint8Array(end - begin - null_count);
    let i_u8 = 0;
    for (let i_buffer = begin; i_buffer < end; i_buffer += 1) {
      if (buffer[i_buffer] !== 0x00) {
        u8[i_u8] = buffer[i_buffer];
        i_u8 += 1;
      }
    }
    return u8;
  }

  // these are meant to be for internal use only

  #lineBuffer;
}
