import { ConcatPrintableBytes, ExtractPrintableBytes } from './lib/Buffer.mjs';
import { Reader } from './lib/Reader.mjs';
import { Tokenizer } from './Tokenizer.mjs';

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

export class Lexer {
  /**
   * @param {Reader} reader
   */
  constructor(reader) {
    this.#tokenizer = new Tokenizer(reader);
  }

  /**
   * Returns the next line of lexemes along with the current line's buffer.
   * @this {Lexer}
   * @returns {[Uint8Array[], Uint8Array]} [Lexemes, Buffer]
   */
  nextLine() {
    /** @type {Uint8Array[]} */
    const lexemes = [];
    const [tokens, buffer] = this.#tokenizer.nextLine();
    let [begin, end] = [0, tokens.length];

    let in_array = false;
    let in_quote = false;

    for (let i_token = 0; i_token < end; i_token += 1) {
      let token = tokens[i_token];
      let length = token.length;

      // quotes can start inside arrays, but arrays cannot start inside quotes
      if (in_quote === false && in_array === false) {
        // start both
        if (token[0] === 0x5b /* [ */ && token[1] === 0x22 /* " */) {
          token[0] = 0x00;
          in_array = true;
          token[1] = 0x00;
          in_quote = true;
        }
        // start array only
        if (token[0] === 0x5b /* [ */) {
          token[0] = 0x00;
          in_array = true;
        }
        // start quote only
        if (token[0] === 0x22 /* " */) {
          token[0] = 0x00;
          in_quote = true;
        }
      }
      if (in_quote === false && in_array === true) {
        // start quote
        if (token[0] === 0x22 /* " */) {
          token[0] = 0x00;
          in_quote = true;
        }
      }

      if (in_array === true) {
        // adjust lexeme type
      }

      // quotes can end inside arrays, but arrays cannot end inside quotes
      if (in_quote === true && in_array === true) {
        // end both
        if (token[length - 2] === 0x22 /* " */ && token[length - 1] === 0x5d /* ] */) {
          token[length - 2] = 0x00;
          in_quote = false;
          token[length - 1] = 0x00;
          in_array = false;
        }
        // end quote only, remove comma
        if (token[length - 2] === 0x22 /* " */ && token[length - 1] === 0x2c /* , */) {
          token[length - 2] = 0x00;
          in_quote = false;
          token[length - 1] = 0x00;
        }
        // end quote only
        if (token[length - 1] === 0x22 /* " */) {
          token[length - 1] = 0x00;
          in_quote = false;
        }
      }
      if (in_quote === true && in_array === false) {
        // end quote
        if (token[length - 1] === 0x22 /* " */) {
          token[length - 1] = 0x00;
          in_quote = false;
        }
      }
      if (in_quote === false && in_array === true) {
        // remove comma
        if (token[length - 1] === 0x2c /* , */) {
          token[length - 1] = 0x00;
        }
        // end array
        if (token[length - 1] === 0x5d /* ] */) {
          token[length - 1] = 0x00;
          in_array = false;
        }
      }

      if (in_quote === true) {
        // don't push tokens
      } else {
        if (begin === i_token) {
          console.log('single');
          lexemes.push(ExtractPrintableBytes(token));
          begin = i_token + 1;
        } else {
          console.log('multie');
          lexemes.push(ConcatPrintableBytes(tokens.slice(begin, i_token + 1)));
          begin = i_token + 1;
        }
      }
    }
    return [lexemes, buffer];
  }

  // these are meant to be for internal use only

  #tokenizer;
}
