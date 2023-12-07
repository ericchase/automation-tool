export class Buffer {
  constructor() {}

  /**
   * Returns a slice of the buffer containing the next meaningful sequence of
   * bytes, or an empty buffer if there are no more bytes available.
   * @this {Buffer}
   * @return {Uint8Array} buffer
   */
  next() {
    return Buffer.Empty;
  }

  static Empty = new Uint8Array(0);
}

/**
 * @param {Uint8Array} buffer
 * @return {string}
 */
export function GetPrintableCharacters(buffer) {
  const printable = new Uint8Array(buffer.byteLength);
  let i_printable = 0;
  for (let i = 0; i < buffer.byteLength; i += 1) {
    if ((buffer[i] >= 0x00 && buffer[i] <= 0x1f) || buffer[i] === 0x7f) {
      continue;
    }
    printable[i_printable++] = buffer[i];
  }
  return new TextDecoder().decode(printable);
}
