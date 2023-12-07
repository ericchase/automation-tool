import { Buffer } from './Buffer.mjs';
import { Reader } from './Reader.mjs';

export class LineBuffer extends Buffer {
  /** @param {Reader} reader */
  constructor(reader, size = 65536) {
    super();
    this.#nextLineDone = false;
    this.#nextLineGenerator = this.#nextLine();
    this.#reader = reader;
    this.#size = size;
  }

  /**
   * Returns a slice of the buffer containing the next line, or an empty buffer
   * if there are no more bytes available.
   * @this {LineBuffer}
   * @return {Uint8Array}
   */
  next() {
    if (this.#nextLineDone === false) {
      const { done, value } = this.#nextLineGenerator.next();
      this.#nextLineDone = done === true;
      return value;
    }
    return Buffer.Empty;
  }

  // these are meant to be for internal use only

  /**
   * @this {LineBuffer}
   * @return {Generator<Uint8Array, Uint8Array, unknown>}
   */
  *#nextLine() {
    const data = new Uint8Array(this.#size);
    let length = this.#reader.read(data);
    let [begin, end] = [0, 0];
    while (length > 0) {
      end = end - begin + length;
      begin = 0;
      for (let i = 0; i < end; i += 1) {
        if (data[i] === 0x0a) {
          yield new Uint8Array(data.buffer, begin, i - begin);
          begin = i + 1;
        }
      }
      // copy unconsumed bytes to the beginning of the buffer
      if (begin < end) {
        data.copyWithin(0, begin, end);
      }
      if (end - begin >= data.byteLength) {
        throw 'LineReader: Error: Buffer too small to hold next line.';
      }
      length = this.#reader.read(new Uint8Array(data.buffer, end - begin));
    }
    return new Uint8Array(data.buffer, begin, end - begin);
  }

  #nextLineDone;
  #nextLineGenerator;
  #reader;
  #size;
}
