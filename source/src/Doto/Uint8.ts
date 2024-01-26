const encode = ((encoder) => encoder.encode.bind(encoder))(new TextEncoder());
const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

// prettier-ignore
export const Uint8Type = {
  Null: 0x00,        // null character
  Tab: 0x09,         // tab
  LF: 0x0a,          // line feed
  FF: 0x0c,          // form feed
  CR: 0x0d,          // carriage return
  Space: 0x20,       // space
  DoubleQuote: 0x22, // double quote
  Slash: 0x2f,       // slash
  Backslash: 0x5c,   // backslash
};

export interface IUint8Reader {
  contents: Uint8Array;
  offset: number;
}

export class Uint8Reader implements IUint8Reader {
  constructor(
    public contents: Uint8Array,
    public offset = 0,
  ) {}

  /**
   * Copies the next available bytes from the internal buffer into the external
   * `bytes` buffer. The first available byte will be copied into `bytes`
   * starting at the offset `start` (or 0 if not provided). All available bytes
   * will be copied until the `bytes` buffer is filled up to but not including
   * the offset `end` (or `bytes.length` if not provided). The number of bytes
   * successfully copied will be returned.
   */
  async read(this: Uint8Reader, u8Array: Uint8Array, start = 0, end = u8Array.length): Promise<number> {
    let count = 0;
    for (let index = start; index < end && this.offset < this.contents.length; index++) {
      u8Array[index] = this.contents[this.offset];
      this.offset++;
      count++;
    }
    return count;
  }
}

export class StringReader extends Uint8Reader {
  constructor(str: string) {
    super(encode(str));
  }
}

export interface IUint8View<T> {
  contents: T;
  start: number;
  end: number;
}

export class Uint8View implements IUint8View<Uint8Array> {
  constructor(
    public contents: Uint8Array,
    public start = 0,
    public end = contents.length,
  ) {}

  get length() {
    return this.end - this.start;
  }

  /**
   * Create a new `View` using a new `start` value. The new `start` value must
   * be greater than the original `start` value and less than or equal to the
   * `end` value. If the new `start` value is less than or equal to the original
   * `start` value or greater than the `end` value, the original view is
   * returned.
   */
  newStart(this: Uint8View, start: number): Uint8View {
    if (start > this.start) {
      if (start <= this.end) {
        return new Uint8View(this.contents, start, this.end);
      }
    }
    return this;
  }

  /**
   * Create a new `View` using a new `end` value. The new `end` value must be
   * greater than or equal to the `start` value and less than the original `end`
   * value. If the new `end` value is less than the `start` value or greater
   * than or equal to the original `end` value, the original view is returned.
   */
  newEnd(this: Uint8View, end: number): Uint8View {
    if (end >= this.start) {
      if (end < this.end) {
        return new Uint8View(this.contents, this.start, end);
      }
    }
    return this;
  }

  /**
   * Create a new `View` using new `start` and `end` values. The new `start`
   * value must be greater than or equal to the original `start` value. The new
   * `end` value must be less than or equal to the original `end` value. The
   * `length` of the new view must be less than the `length` of the original
   * view; otherwise, the original view is returned.
   */
  newStartAndEnd(this: Uint8View, start: number, end: number): Uint8View {
    if (start >= this.start) {
      if (end <= this.end) {
        if (end - start < this.length) {
          return new Uint8View(this.contents, start, end);
        }
      }
    }
    return this;
  }

  toBytes(this: Uint8View): Uint8Array {
    return this.contents.slice(this.start, this.end);
  }
}

export const EmptyUint8Array = new Uint8Array(0);
export const Uint8ViewEOF = new Uint8View(EmptyUint8Array);

export function Uint8ViewCompare(view1: Uint8View, view2: Uint8View): boolean {
  if (view1.length !== view2.length) {
    return false;
  }
  let index1 = view1.start;
  let index2 = view2.start;
  for (let counter = 0; counter < view1.length; counter++) {
    if (view1.contents[index1] !== view2.contents[index2]) {
      return false;
    }
    index1++;
    index2++;
  }
  return true;
}

export function Uint8ViewConcat(viewArray: Uint8View[]): Uint8View {
  let size = 0;
  for (const view of viewArray) {
    size += view.length;
  }
  const u8Array = new Uint8Array(size);
  let offset = 0;
  for (const view of viewArray) {
    for (let index = view.start; index < view.end; index++) {
      u8Array[offset] = view.contents[index];
      offset++;
    }
  }
  return new Uint8View(u8Array);
}

export function Uint8ViewToPrintableBytes(view: Uint8View): Uint8Array {
  let size = 0;
  for (let index = view.start; index < view.end; index++) {
    const u8 = view.contents[index];
    if ((u8 >= 0x00 && u8 <= 0x1f) || u8 === 0x7f) {
      continue;
    }
    size++;
  }
  const u8Array = new Uint8Array(size);
  let offset = 0;
  for (let index = view.start; index < view.end; index++) {
    const u8 = view.contents[index];
    if ((u8 >= 0x00 && u8 <= 0x1f) || u8 === 0x7f) {
      continue;
    }
    u8Array[offset] = u8;
    offset++;
  }
  return u8Array;
}

export function Uint8ViewToString(view: Uint8View): string {
  return decode(Uint8ViewToPrintableBytes(view));
}

export function StringToUint8View(text: string): Uint8View {
  return new Uint8View(new Uint8Array(encode(text)));
}
