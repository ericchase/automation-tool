import { Command } from './Command.mjs';
import { $loop } from './lib.mjs';
import { Buffer } from './lib/Buffer.mjs';
import { BufferView } from './lib/BufferView.mjs';
import { BACKSLASH, CR, DOUBLE_QUOTE, EmptyBuffer, LF, NULL, SPACE, TAB } from './lib/Constants.mjs';
import { LineBuffer } from './lib/LineBuffer.mjs';
import { Reader } from './lib/Reader.mjs';

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

/**
 * @typedef {[number, number]} Range
 */

export class Parser {
  /**
   * @param {Reader} reader
   */
  constructor(reader) {
    this.#lineBuffer = new LineBuffer(reader);
  }

  /**
   * @returns {Command}
   */
  nextCommand() {
    const lineView = this.#lineBuffer.next();
    const lineBuffer = lineView.toNewBuffer();
    if (lineView !== BufferView.EOF) {
      try {
        const commandNameView = nextToken(lineView);
        const commandName = toString(commandNameView);
        if (commandName.length > 0) {
          const command = new Command(commandName, [commandName], lineBuffer);
          let currentView = commandNameView;
          $loop(
            () => nextToken(lineView.newStart(currentView.end)),
            (nextView) => nextView.length > 0,
            (nextView) => {
              command.tokens.push(toPrintableString(nextView));
              currentView = nextView;
            },
          );
          return command;
        }
      } catch (err) {
        throw `Invalid Syntax >> ${toPrintableString(lineView)}`;
      }
      return Parser.EmptyLine;
    }
    return Parser.EOF;
  }

  static EmptyLine = new Command('', [], EmptyBuffer);
  static EOF = new Command('', [], EmptyBuffer);

  // these are meant to be for internal use only

  #lineBuffer;
}

/**
 * Extracts all bytes that are not null characters (0x00).
 * @param {BufferView} view
 * @returns {Uint8Array}
 */
function extractNonNullBytes(view) {
  let null_count = 0;
  for (let offset = view.start; offset < view.end; offset++) {
    if (view.buffer[offset] === NULL) {
      null_count++;
    }
  }
  const u8 = new Uint8Array(view.length - null_count);
  let i_u8 = 0;
  for (let offset = view.start; offset < view.end; offset++) {
    if (view.buffer[offset] !== NULL) {
      u8[i_u8] = view.buffer[offset];
      i_u8++;
    }
  }
  return u8;
}

/**
 * @param {BufferView} view
 * @returns {BufferView}
 */
function nextToken(view) {
  const startOffset = nextNonWhiteSpace(view);
  if (startOffset < view.end) {
    // if token starts with double quote, skip to next double quote
    if (view.buffer[startOffset] === DOUBLE_QUOTE) {
      const endOffset = nextStringMarker(view.newStart(startOffset + 1));
      const newView = view.newOffsets(startOffset, endOffset);
      processStringLiteral(newView);
      return newView;
    }
  }
  // else
  const endOffset = nextWhiteSpace(view.newStart(startOffset));
  return view.newOffsets(startOffset, endOffset);
}

/**
 * @param {BufferView} view
 * @returns {number} offset to view.buffer
 */
function nextNonWhiteSpace(view) {
  let offset = view.start;
  while (offset < view.end) {
    switch (view.buffer[offset]) {
      case TAB:
      case LF:
      case CR:
      case SPACE:
        break;
      default:
        return offset;
    }
    offset++;
  }
  return offset;
}

/**
 * Finds the next double quote not preceded by a backslash.
 * @param {BufferView} view
 * @returns {number} offset to view.buffer
 */
function nextStringMarker(view) {
  let offset = view.start;
  let escapeNext = false;
  while (offset < view.end) {
    switch (view.buffer[offset]) {
      case DOUBLE_QUOTE:
        if (escapeNext === true) {
          escapeNext = false;
          break;
        }
        return offset + 1;
      case BACKSLASH:
        escapeNext = !escapeNext;
        break;
      default:
        escapeNext = false;
        break;
    }
    offset++;
  }
  throw 'error';
}

/**
 * @param {BufferView} view
 * @returns {number} offset to view.buffer
 */
function nextWhiteSpace(view) {
  let offset = view.start;
  while (offset < view.end) {
    switch (view.buffer[offset]) {
      case TAB:
      case LF:
      case CR:
      case SPACE:
        return offset;
    }
    offset++;
  }
  return offset;
}

/**
 * Replace non-printable bytes with null bytes.
 * @param {BufferView} view
 */
function processNonPrintableBytes(view) {
  for (let offset = view.start; offset < view.end; offset++) {
    if ((view.buffer[offset] > 0x00 && view.buffer[offset] <= 0x1f) || view.buffer[offset] === 0x7f) {
      view.buffer[offset] = NULL;
    }
  }
}

/**
 * Replace string literal markers and escape bytes.
 * @param {BufferView} view
 */
function processStringLiteral(view) {
  view.buffer[view.start] = NULL; // string literal start marker
  view.buffer[view.end - 1] = NULL; // string literal end marker

  let escapeNext = false;
  for (let offset = view.start; offset < view.end; offset++) {
    switch (view.buffer[offset]) {
      case DOUBLE_QUOTE:
        if (escapeNext === true) {
          escapeNext = false;
          view.buffer[offset - 1] = NULL;
        }
        break;
      case BACKSLASH:
        if (escapeNext === true) {
          escapeNext = false;
          view.buffer[offset - 1] = NULL;
        }
        escapeNext = true;
        break;
      default:
        escapeNext = false;
        break;
    }
  }
}

/**
 * @param {BufferView} view
 */
function toString(view) {
  return decode(view.toNewBuffer());
}

/**
 * @param {BufferView} view
 */
function toPrintableString(view) {
  processNonPrintableBytes(view);
  return decode(extractNonNullBytes(view));
}
