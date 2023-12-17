import { BufferView } from './BufferView.mjs';

export class Buffer {
  constructor() {}

  /**
   * Returns a view of the buffer containing the next meaningful sequence of
   * bytes, or the EmptyView if there are no more bytes available.
   * @this {Buffer}
   * @returns {BufferView}
   */
  next() {
    return Buffer.EmptyView;
  }

  static Empty = new Uint8Array(0);
  static EmptyView = new BufferView(Buffer.Empty);
}

/**
 * Merge bytes from multiple buffers.
 * @param {Uint8Array[]} buffers
 * @returns {Uint8Array}
 */
export function ConcatBytes(buffers) {
  let length = 0;
  for (const buffer of buffers) {
    length += buffer.length;
  }
  const merged = new Uint8Array(length);
  let offset = 0;
  for (const buffer of buffers) {
    merged.set(buffer, offset);
    offset += buffer.length;
  }
  return merged;
}

/**
 * Extract and merge printable bytes from multiple buffer.
 * @param {Uint8Array[]} buffers
 * @returns {Uint8Array}
 */
export function ConcatPrintableBytes(buffers) {
  const extracted = [];
  let length = 0;
  for (const buffer of buffers) {
    const bytes = ExtractPrintableBytes(buffer);
    length += bytes.length;
    extracted.push(bytes);
  }
  const merged = new Uint8Array(length);
  let offset = 0;
  for (const buffer of extracted) {
    merged.set(buffer, offset);
    offset += buffer.length;
  }
  return merged;
}

/**
 * Extract printable bytes from buffer.
 * @param {Uint8Array} buffer
 * @returns {Uint8Array}
 */
export function ExtractPrintableBytes(buffer) {
  let length = 0;
  for (let i = 0; i < buffer.byteLength; i += 1) {
    if ((buffer[i] >= 0x00 && buffer[i] <= 0x1f) || buffer[i] === 0x7f) {
      continue;
    }
    length += 1;
  }
  const extracted = new Uint8Array(length);
  let i_extracted = 0;
  for (let i = 0; i < buffer.byteLength; i += 1) {
    if ((buffer[i] >= 0x00 && buffer[i] <= 0x1f) || buffer[i] === 0x7f) {
      continue;
    }
    extracted[i_extracted] = buffer[i];
    i_extracted += 1;
  }
  return extracted;
}
