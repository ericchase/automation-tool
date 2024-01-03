import { BufferReader } from './BufferReader.mjs';

export class StringReader extends BufferReader {
  /** @param {string} string */
  constructor(string) {
    super(new TextEncoder().encode(string));
  }
}
