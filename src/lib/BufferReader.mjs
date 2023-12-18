import { Reader } from './Reader.mjs';

export class BufferReader extends Reader {
  /** @param {Uint8Array} buffer */
  constructor(buffer) {
    super();
    this.#buffer = buffer;
    this.#index = 0;
  }

  /**
   * Copies next `buffer.length` or `end-start` bytes from internal buffer into
   * `buffer`, and returns the number of bytes copied. The first bytes will be
   * copied to offset `start` and continue from there.
   * @this {BufferReader}
   * @param {Uint8Array} buffer
   * @param {number=} start
   * @param {number=} end
   * @returns {number} bytes copied
   */
  read(buffer, start, end) {
    start ??= 0;
    end ??= buffer.length;
    let i_buffer = start;
    let bytes_copied = 0;
    while (this.#index < this.#buffer.length && i_buffer < end) {
      buffer[i_buffer] = this.#buffer[this.#index];
      i_buffer++;
      this.#index++;
      bytes_copied++;
    }
    return bytes_copied;
  }

  /** @type {Uint8Array} */
  #buffer;
  /** @type {number} */
  #index;
}
