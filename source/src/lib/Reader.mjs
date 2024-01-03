export class Reader {
  constructor() {}

  /**
   * Copies next `buffer.length` or `end-start` bytes from internal buffer into
   * `buffer`, and returns the number of bytes copied. The first bytes will be
   * copied to offset `start` and continue from there.
   * @this {Reader}
   * @param {Uint8Array} buffer
   * @param {number=} start
   * @param {number=} end
   * @returns {number} bytes copied
   */
  read(buffer, start, end) {
    return 0;
  }
}
