import { describe, expect, test } from '@jest/globals';

import { Tokenize, TokenizeLine } from '../../../../source/build/Doto/Parse/Parser.js';
import { Token, TokenType } from '../../../../source/build/Doto/Parse/Token.js';
import { EmptyUint8Array, StringReader, Uint8Reader, Uint8ViewToString } from '../../../../source/build/Doto/Uint8.js';

const encode = ((encoder) => encoder.encode.bind(encoder))(new TextEncoder());
const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

function encodeEach(arr: string[]) {
  return arr.map((str) => encode(str));
}

function checkToken(token: Token, type: TokenType, text: string) {
  if (token.type === type) {
    if (Uint8ViewToString(token.view) === text) {
      return true;
    }
  }
  return false;
}

describe('Parser', () => {
  describe('TokenizeLine', () => {
    test('empty', async () => {
      const line = TokenizeLine(1, EmptyUint8Array);
      expect(line.tokens.length).toBe(0);
    });
    test('1 glyph', async () => {
      const line = TokenizeLine(1, encode('glyph'));
      expect(line.tokens.length).toBe(1);
      expect(checkToken(line.tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
    });
    test('2 glyphs', async () => {
      const line = TokenizeLine(1, encode('glyph glyph'));
      expect(line.tokens.length).toBe(3);
      expect(checkToken(line.tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
      expect(checkToken(line.tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(line.tokens[2], TokenType.Glyph, 'glyph')).toBe(true);
    });
    test('double quotes', async () => {
      const line = TokenizeLine(1, encode('"glyph"'));
      expect(line.tokens.length).toBe(3);
      expect(checkToken(line.tokens[0], TokenType.DoubleQuote, '"')).toBe(true);
      expect(checkToken(line.tokens[1], TokenType.Glyph, 'glyph')).toBe(true);
      expect(checkToken(line.tokens[2], TokenType.DoubleQuote, '"')).toBe(true);
    });
    test('backslashes', async () => {
      const line = TokenizeLine(1, encode('a\\b\\c'));
      expect(line.tokens.length).toBe(5);
      expect(checkToken(line.tokens[0], TokenType.Glyph, 'a')).toBe(true);
      expect(checkToken(line.tokens[1], TokenType.BackSlash, '\\')).toBe(true);
      expect(checkToken(line.tokens[2], TokenType.Glyph, 'b')).toBe(true);
      expect(checkToken(line.tokens[3], TokenType.BackSlash, '\\')).toBe(true);
      expect(checkToken(line.tokens[4], TokenType.Glyph, 'c')).toBe(true);
    });
    test('backslashes and double quotes', async () => {
      const line = TokenizeLine(1, encode('"a\\"b\\"c"'));
      expect(line.tokens.length).toBe(9);
      expect(checkToken(line.tokens[0], TokenType.DoubleQuote, '"')).toBe(true);
      expect(checkToken(line.tokens[1], TokenType.Glyph, 'a')).toBe(true);
      expect(checkToken(line.tokens[2], TokenType.BackSlash, '\\')).toBe(true);
      expect(checkToken(line.tokens[3], TokenType.DoubleQuote, '"')).toBe(true);
      expect(checkToken(line.tokens[4], TokenType.Glyph, 'b')).toBe(true);
      expect(checkToken(line.tokens[5], TokenType.BackSlash, '\\')).toBe(true);
      expect(checkToken(line.tokens[6], TokenType.DoubleQuote, '"')).toBe(true);
      expect(checkToken(line.tokens[7], TokenType.Glyph, 'c')).toBe(true);
      expect(checkToken(line.tokens[8], TokenType.DoubleQuote, '"')).toBe(true);
    });
  });
  describe('Tokenize', () => {
    test('empty', async () => {
      const lines = await Tokenize(new Uint8Reader(EmptyUint8Array));
      expect(lines.length).toBe(0);
    });
    test('only linefeed', async () => {
      const lines = await Tokenize(new StringReader('\n'));
      expect(lines.length).toBe(0);
    });
    test('1 glyph', async () => {
      const lines = await Tokenize(new StringReader('glyph'));
      expect(lines.length).toBe(1);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      let i = 0;
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
    });
    test('1 glyph, begins with linefeed', async () => {
      const lines = await Tokenize(new StringReader('\nglyph'));
      expect(lines.length).toBe(1);
      expect(lines[0].number).toBe(2);
      expect(lines[0].tokens.length).toBe(1);
      let i = 0;
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
    });
    test('1 glyph, ends with linefeed', async () => {
      const lines = await Tokenize(new StringReader('glyph\n'));
      expect(lines.length).toBe(1);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      let i = 0;
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
    });
    test('1 glyph, begins and ends with linefeed', async () => {
      const lines = await Tokenize(new StringReader('\nglyph\n'));
      expect(lines.length).toBe(1);
      expect(lines[0].number).toBe(2);
      expect(lines[0].tokens.length).toBe(1);
      let i = 0;
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
    });
    test('2 glyphs, 1 line', async () => {
      const lines = await Tokenize(new StringReader('glyph glyph'));
      expect(lines.length).toBe(1);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(3);
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
      expect(checkToken(lines[0].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[2], TokenType.Glyph, 'glyph')).toBe(true);
    });
    test('3 glyphs, 1 line', async () => {
      const lines = await Tokenize(new StringReader('one two three'));
      expect(lines.length).toBe(1);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(5);
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'one')).toBe(true);
      expect(checkToken(lines[0].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[2], TokenType.Glyph, 'two')).toBe(true);
      expect(checkToken(lines[0].tokens[3], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[4], TokenType.Glyph, 'three')).toBe(true);
    });
    test('3 glyphs, 1 line, begins and ends with linefeed', async () => {
      const lines = await Tokenize(new StringReader('\none two three\n'));
      expect(lines.length).toBe(1);
      expect(lines[0].number).toBe(2);
      expect(lines[0].tokens.length).toBe(5);
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'one')).toBe(true);
      expect(checkToken(lines[0].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[2], TokenType.Glyph, 'two')).toBe(true);
      expect(checkToken(lines[0].tokens[3], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[4], TokenType.Glyph, 'three')).toBe(true);
    });
    test('1 glyph x 2 lines', async () => {
      const lines = await Tokenize(new StringReader('glyph\nglyph'));
      expect(lines.length).toBe(2);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
      expect(lines[1].number).toBe(2);
      expect(lines[1].tokens.length).toBe(1);
      expect(checkToken(lines[1].tokens[0], TokenType.Glyph, 'glyph')).toBe(true);
    });
    test('1 glyph x 3 lines', async () => {
      const lines = await Tokenize(new StringReader('one\ntwo\nthree'));
      expect(lines.length).toBe(3);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'one')).toBe(true);
      expect(lines[1].number).toBe(2);
      expect(lines[1].tokens.length).toBe(1);
      expect(checkToken(lines[1].tokens[0], TokenType.Glyph, 'two')).toBe(true);
      expect(lines[2].number).toBe(3);
      expect(lines[2].tokens.length).toBe(1);
      expect(checkToken(lines[2].tokens[0], TokenType.Glyph, 'three')).toBe(true);
    });
    test('1 glyph x 3 lines, begins and ends with linefeed', async () => {
      const lines = await Tokenize(new StringReader('\none\ntwo\nthree\n'));
      expect(lines.length).toBe(3);
      expect(lines[0].number).toBe(2);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'one')).toBe(true);
      expect(lines[1].number).toBe(3);
      expect(lines[1].tokens.length).toBe(1);
      expect(checkToken(lines[1].tokens[0], TokenType.Glyph, 'two')).toBe(true);
      expect(lines[2].number).toBe(4);
      expect(lines[2].tokens.length).toBe(1);
      expect(checkToken(lines[2].tokens[0], TokenType.Glyph, 'three')).toBe(true);
    });
    test('1 space x 2 lines', async () => {
      const lines = await Tokenize(new StringReader(' \n '));
      expect(lines.length).toBe(2);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(lines[1].number).toBe(2);
      expect(lines[1].tokens.length).toBe(1);
      expect(checkToken(lines[1].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
    });
    test('2 glyphs x 2 lines', async () => {
      const lines = await Tokenize(new StringReader('one two\nthree four'));
      expect(lines.length).toBe(2);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(3);
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'one')).toBe(true);
      expect(checkToken(lines[0].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[2], TokenType.Glyph, 'two')).toBe(true);
      expect(lines[1].number).toBe(2);
      expect(lines[1].tokens.length).toBe(3);
      expect(checkToken(lines[1].tokens[0], TokenType.Glyph, 'three')).toBe(true);
      expect(checkToken(lines[1].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[1].tokens[2], TokenType.Glyph, 'four')).toBe(true);
    });
    test('mix and match', async () => {
      const lines = await Tokenize(new StringReader('a\n lazy \ndog\nand \na quick\n fox\n \n \n'));
      expect(lines.length).toBe(8);
      expect(lines[0].number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.Glyph, 'a')).toBe(true);
      expect(lines[1].number).toBe(2);
      expect(lines[1].tokens.length).toBe(3);
      expect(checkToken(lines[1].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[1].tokens[1], TokenType.Glyph, 'lazy')).toBe(true);
      expect(checkToken(lines[1].tokens[2], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(lines[2].number).toBe(3);
      expect(lines[2].tokens.length).toBe(1);
      expect(checkToken(lines[2].tokens[0], TokenType.Glyph, 'dog')).toBe(true);
      expect(lines[3].number).toBe(4);
      expect(lines[3].tokens.length).toBe(2);
      expect(checkToken(lines[3].tokens[0], TokenType.Glyph, 'and')).toBe(true);
      expect(checkToken(lines[3].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(lines[4].number).toBe(5);
      expect(lines[4].tokens.length).toBe(3);
      expect(checkToken(lines[4].tokens[0], TokenType.Glyph, 'a')).toBe(true);
      expect(checkToken(lines[4].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[4].tokens[2], TokenType.Glyph, 'quick')).toBe(true);
      expect(lines[5].number).toBe(6);
      expect(lines[5].tokens.length).toBe(2);
      expect(checkToken(lines[5].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[5].tokens[1], TokenType.Glyph, 'fox')).toBe(true);
      expect(lines[6].number).toBe(7);
      expect(lines[6].tokens.length).toBe(1);
      expect(checkToken(lines[6].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(lines[7].number).toBe(8);
      expect(lines[7].tokens.length).toBe(1);
      expect(checkToken(lines[7].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
    });
  });
});
