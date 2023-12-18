import { Buffer } from './Buffer.mjs';
import { BufferView } from './BufferView.mjs';
import { CR, LF } from './Constants.mjs';
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
   * Returns a view of the buffer containing the next line, or the EmptyView if
   * there are no more bytes available.
   * @this {LineBuffer}
   * @returns {BufferView}
   */
  next() {
    if (this.#nextLineDone === false) {
      const { done, value: view } = this.#nextLineGenerator.next();
      this.#nextLineDone = done === true;
      return view;
    }
    return Buffer.EmptyView;
  }

  // these are meant to be for internal use only

  /**
   * @this {LineBuffer}
   * @returns {Generator<BufferView, BufferView, unknown>}
   */
  *#nextLine() {
    const buffer = new Uint8Array(this.#size);
    let length = this.#reader.read(buffer);
    let [begin, end] = [0, length];
    while (length > 0) {
      for (let i = 0; i < end; i += 1) {
        if (buffer[i] === LF) {
          yield new BufferView(buffer, begin, buffer[i - 1] === CR ? i - 1 : i);
          begin = i + 1;
        }
      }
      // copy unconsumed bytes to the beginning of the buffer
      if (begin < end) {
        buffer.copyWithin(0, begin, end);
      }
      if (end - begin >= buffer.byteLength) {
        throw 'LineReader: Error: Buffer too small to hold next line.';
      }
      length = this.#reader.read(buffer, end - begin);
      end = end - begin + length;
      begin = 0;
    }
    return new BufferView(buffer, begin, buffer[end - 1] === CR ? end - 1 : end);
  }

  #nextLineDone;
  #nextLineGenerator;
  #reader;
  #size;
}
