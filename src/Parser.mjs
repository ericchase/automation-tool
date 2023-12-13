import { BufferView } from '../lib/BufferView.mjs';
import { BACKSLASH, CR, DOUBLE_QUOTE, LF, NULL, SPACE, TAB } from '../lib/Constants.mjs';
import { LineBuffer } from '../lib/LineBuffer.mjs';
import { Reader } from '../lib/Reader.mjs';

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
   * @return {{buffer:Uint8Array, tokens:String[]}}
   */
  nextCommand() {
    const view = this.#lineBuffer.next();
    const buffer = view.toNewBuffer();
    if (view.length > 0) {
      const commandName = nextToken(view);
      const commandArgs = view.newStart(commandName.end);
      switch (toString(commandName)) {
        case 'build':
          return { buffer, tokens: parseBuildCommand(commandArgs) };
        case 'watch':
          return { buffer, tokens: parseWatchCommand(commandArgs) };
        case 'copy':
        case 'run':
        case '=>': // subcommand
          throw 'not implemented';
      }
    }
    return { buffer, tokens: [] };
  }

  // these are meant to be for internal use only

  #lineBuffer;
}

/**
 * Extracts all bytes that are not null characters (0x00).
 * @param {BufferView} view
 * @return {Uint8Array}
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
 * @return {String[]}
 */
function parseBuildCommand(view) {
  return [toPrintableString(nextToken(view))];
}

/**
 * @param {BufferView} view
 * @return {String[]}
 */
function parseWatchCommand(view) {
  const tokens = [];
  let nextView = nextToken(view);
  while (nextView.length > 0) {
    tokens.push(toPrintableString(nextView));
    nextView = nextToken(view.newStart(nextView.end));
  }
  return tokens;
}

/**
 * @param {BufferView} view
 * @return {BufferView}
 */
function nextToken(view) {
  const startOffset = nextNonWhiteSpace(view);
  if (startOffset < view.end) {
    // if token starts with double quote, skip to next double quote
    if (view.buffer[startOffset] === DOUBLE_QUOTE) {
      const endOffset = nextStringMarker(view.newStart(startOffset + 1)) + 1;
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
 * @return {number} offset to view.buffer
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
 * @return {number} offset to view.buffer
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
        return offset;
      case BACKSLASH:
        escapeNext = true;
        break;
    }
    offset++;
  }
  return offset;
}

/**
 * @param {BufferView} view
 * @return {number} offset to view.buffer
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
        escapeNext = true;
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
