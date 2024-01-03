import { AbstractView } from './AbstractView.mts';

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

export namespace Byte {
  /**
   * Concatenate bytes from multiple Uint8Arrays.
   */
  export function Concat(bytesArray: Uint8Array[]): Uint8Array {
    let outSize = 0;
    for (const bytes of bytesArray) {
      outSize += bytes.length;
    }
    const outBytes = new Uint8Array(outSize);
    let outOffset = 0;
    for (const bytes of bytesArray) {
      outBytes.set(bytes, outOffset);
      outOffset += bytes.length;
    }
    return outBytes;
  }

  export const EmptyBytes = new Uint8Array(0);

  export function GetPrintable(bytes: Uint8Array): Uint8Array {
    let outSize = 0;
    for (const byte of bytes) {
      if ((byte >= 0x00 && byte <= 0x1f) || byte === 0x7f) {
        continue;
      }
      outSize++;
    }
    const outBytes = new Uint8Array(outSize);
    let outOffset = 0;
    for (const byte of bytes) {
      if ((byte >= 0x00 && byte <= 0x1f) || byte === 0x7f) {
        continue;
      }
      outBytes[outOffset] = byte;
      outOffset++;
    }
    return outBytes;
  }

  export class Reader {
    constructor(public bytes: Uint8Array) {
      this.offset = 0;
    }

    /**
     * Copies the next available bytes from the internal buffer into the external
     * `bytes` buffer. The first available byte will be copied into `bytes`
     * starting at the offset `start` (or 0 if not provided). All available bytes
     * will be copied until the `bytes` buffer is filled up to but not including
     * the offset `end` (or `bytes.length` if not provided). The number of bytes
     * successfully copied will be returned.
     */
    read(this: Reader, bytes: Uint8Array, start = 0, end = bytes.length): number {
      let copyCount = 0;
      for (let index = start; index < end && this.offset < this.bytes.length; index++) {
        bytes[index] = this.bytes[this.offset];
        this.offset++;
        copyCount++;
      }
      return copyCount;
    }

    offset: number;
  }
  export class AsyncReader {
    constructor(public bytes: Uint8Array) {
      this.offset = 0;
    }

    /**
     * Copies the next available bytes from the internal buffer into the external
     * `bytes` buffer. The first available byte will be copied into `bytes`
     * starting at the offset `start` (or 0 if not provided). All available bytes
     * will be copied until the `bytes` buffer is filled up to but not including
     * the offset `end` (or `bytes.length` if not provided). The number of bytes
     * successfully copied will be returned.
     */
    async read(this: AsyncReader, bytes: Uint8Array, start = 0, end = bytes.length): Promise<number> {
      let copyCount = 0;
      for (let index = start; index < end && this.offset < this.bytes.length; index++) {
        bytes[index] = this.bytes[this.offset];
        this.offset++;
        copyCount++;
      }
      return copyCount;
    }

    offset: number;
  }

  export class View extends AbstractView<Uint8Array> {
    constructor(
      bytes: Uint8Array, //
      start = 0,
      end = bytes.length,
    ) {
      super(bytes, start, end);
    }

    toBytes(this: View): Uint8Array {
      return this.contents.slice(this.start, this.end);
    }
    toPrintableBytes(this: View): Uint8Array {
      return Byte.GetPrintable(this.contents.slice(this.start, this.end));
    }
    toString(this: View): string {
      return decode(this.toPrintableBytes());
    }

    static Concat(views: View[]): View {
      let outSize = 0;
      for (const view of views) {
        outSize += view.length;
      }
      const outBytes = new Uint8Array(outSize);
      let outOffset = 0;
      for (const view of views) {
        for (let index = view.start; index < view.end; index++) {
          outBytes[outOffset] = view.contents[index];
          outOffset++;
        }
      }
      return new View(outBytes);
    }

    static EOF = new View(EmptyBytes);
  }

  // prettier-ignore
  export const Type = {
    Null        : 0x00, // null character
    Tab         : 0x09, // tab
    LF          : 0x0a, // line feed
    FF          : 0x0c, // form feed
    CR          : 0x0d, // carriage return
    Space       : 0x20, // space
    DoubleQuote : 0x22, // double quote
    Backslash   : 0x5c, // backslash
  };
}

function* LineGenerator(reader: Byte.Reader, size: number): Generator<Byte.View, Byte.View, unknown> {
  const bytes = new Uint8Array(size);
  let bytesRead = reader.read(bytes);
  let [begin, end] = [0, bytesRead];
  while (bytesRead > 0) {
    for (let i = 0; i < end; i++) {
      if (bytes[i] === Byte.Type.LF) {
        yield new Byte.View(bytes, begin, i);
        begin = i + 1;
      }
    }
    // copy unconsumed bytes to the beginning of the buffer
    if (begin < end) {
      bytes.copyWithin(0, begin, end);
    }
    if (end - begin >= bytes.byteLength) {
      throw 'Buffer too small to hold next line.';
    }
    bytesRead = reader.read(bytes, end - begin);
    end = end - begin + bytesRead;
    begin = 0;
  }
  return new Byte.View(bytes, begin, end);
}
async function* AsyncLineGenerator(reader: Byte.AsyncReader, size: number): AsyncGenerator<Byte.View, Byte.View, unknown> {
  const bytes = new Uint8Array(size);
  let bytesRead = await reader.read(bytes);
  let [begin, end] = [0, bytesRead];
  while (bytesRead > 0) {
    for (let i = 0; i < end; i++) {
      if (bytes[i] === Byte.Type.LF) {
        yield new Byte.View(bytes, begin, i);
        begin = i + 1;
      }
    }
    // copy unconsumed bytes to the beginning of the buffer
    if (begin < end) {
      bytes.copyWithin(0, begin, end);
    }
    if (end - begin >= bytes.byteLength) {
      throw 'Buffer too small to hold next line.';
    }
    bytesRead = await reader.read(bytes, end - begin);
    end = end - begin + bytesRead;
    begin = 0;
  }
  return new Byte.View(bytes, begin, end);
}

export class LineProvider {
  constructor(reader: Byte.Reader, size = 65536) {
    this.done = false;
    this._generator = LineGenerator(reader, size);
    this._reader = reader;
    this._size = size;
  }

  next(this: LineProvider): Byte.View {
    if (this.done === false) {
      try {
        const { done, value: view } = this.generator.next();
        this.done = done === true;
        return view;
      } catch (err) {
        throw 'LineProvider: ' + err;
      }
    }
    return Byte.View.EOF;
  }

  get generator() {
    return this._generator;
  }
  get reader() {
    return this._reader;
  }
  get size() {
    return this._size;
  }

  done: boolean;

  private _generator: Generator<Byte.View, Byte.View, unknown>;
  private _reader: Byte.Reader;
  private _size: number;
}
export class AsyncLineProvider {
  constructor(reader: Byte.AsyncReader, size = 65536) {
    this.done = false;
    this._generator = AsyncLineGenerator(reader, size);
    this._reader = reader;
    this._size = size;
  }

  async next(this: AsyncLineProvider): Promise<Byte.View> {
    if (this.done === false) {
      try {
        const { done, value: view } = await this.generator.next();
        this.done = done === true;
        return view;
      } catch (err) {
        throw 'AsyncLineProvider: ' + err;
      }
    }
    return Byte.View.EOF;
  }

  get generator() {
    return this._generator;
  }
  get reader() {
    return this._reader;
  }
  get size() {
    return this._size;
  }

  done: boolean;

  private _generator: AsyncGenerator<Byte.View, Byte.View, unknown>;
  private _reader: Byte.AsyncReader;
  private _size: number;
}
