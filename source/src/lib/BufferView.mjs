import { EmptyBuffer } from './Constants.mjs';

export class BufferView {
  /**
   * By convention, BufferView.end is considered outside of the view.
   * @param {Uint8Array} buffer
   * @param {number} start
   * @param {number=} end
   */
  constructor(buffer, start = 0, end) {
    end ??= buffer.length;
    this.buffer = buffer;
    this.start = start;
    this.end = end;
    this.length = end - start;
  }

  /**
   * Create new view using new start value. New start value must fall between
   * old start value and end value, else return this view.
   * @this {BufferView}
   * @param {number} start
   */
  newStart(start) {
    if (start > this.start && start <= this.end) {
      return new BufferView(this.buffer, start, this.end);
    } else {
      return this;
    }
  }

  /**
   * Create new view using new end value. New end value must fall between old
   * end value and start value, else return this view.
   * @this {BufferView}
   * @param {number} end
   */
  newEnd(end) {
    if (end >= this.start && end < this.end) {
      return new BufferView(this.buffer, this.start, end);
    } else {
      return this;
    }
  }

  /**
   * Create new view using new start and end values. New start and end values
   * must fall between old start and end values, else return this view.
   * @this {BufferView}
   * @param {number} start
   * @param {number} end
   */
  newOffsets(start, end) {
    if ((start > this.start || end < this.end) && start <= end) {
      return new BufferView(this.buffer, start, end);
    } else {
      return this;
    }
  }

  /**
   * Creates and returns a new Uint8Array with the bytes described by this
   * BufferView copied into it.
   * @this {BufferView}
   */
  toNewBuffer() {
    return this.buffer.slice(this.start, this.end);
  }

  static EOF = new BufferView(EmptyBuffer);
}

/**
 * Merge bytes from multiple buffers.
 * @param {BufferView[]} views
 * @returns {BufferView}
 */
export function ConcatViews(views) {
  let bufferSize = 0;
  for (const view of views) {
    bufferSize += view.length;
  }
  const buffer = new Uint8Array(bufferSize);
  let offset = 0;
  for (const view of views) {
    for (let index = view.start; index < view.end; index++) {
      buffer[offset] = view.buffer[index];
      offset++;
    }
  }
  return new BufferView(buffer);
}
