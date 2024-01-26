import { describe, expect, test } from '@jest/globals';
test('canary', () => expect(true).toBe(true));

import { Parse, ParseLine, Tokenize, TokenizeLine } from '../../../../source/build/Doto/Parse/Parser.js';
import { IParsedToken, IToken, ParsedTokenType, TokenType } from '../../../../source/build/Doto/Parse/Token.js';
import { EmptyUint8Array, StringReader, Uint8Reader, Uint8ViewToString } from '../../../../source/build/Doto/Uint8.js';

const encode = ((encoder) => encoder.encode.bind(encoder))(new TextEncoder());
const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

function encodeEach(arr: string[]) {
  return arr.map((str) => encode(str));
}

function checkToken(token: IToken, type: TokenType, text: string) {
  if (token.type === type) {
    if (Uint8ViewToString(token.view) === text) {
      return true;
    }
  }
  return false;
}
function checkParsedToken(token: IParsedToken, type: ParsedTokenType, text: string) {
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
    test('1 string', async () => {
      const line = TokenizeLine(1, encode('string'));
      expect(line.tokens.length).toBe(1);
      expect(checkToken(line.tokens[0], TokenType.String, 'string')).toBe(true);
    });
    test('2 strings', async () => {
      const line = TokenizeLine(1, encode('string string'));
      expect(line.tokens.length).toBe(3);
      expect(checkToken(line.tokens[0], TokenType.String, 'string')).toBe(true);
      expect(checkToken(line.tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(line.tokens[2], TokenType.String, 'string')).toBe(true);
    });
    test('double quotes', async () => {
      const line = TokenizeLine(1, encode('"string"'));
      expect(line.tokens.length).toBe(3);
      expect(checkToken(line.tokens[0], TokenType.DoubleQuote, '"')).toBe(true);
      expect(checkToken(line.tokens[1], TokenType.String, 'string')).toBe(true);
      expect(checkToken(line.tokens[2], TokenType.DoubleQuote, '"')).toBe(true);
    });
    test('backslashes', async () => {
      const line = TokenizeLine(1, encode('a\\b\\c'));
      expect(line.tokens.length).toBe(5);
      expect(checkToken(line.tokens[0], TokenType.String, 'a')).toBe(true);
      expect(checkToken(line.tokens[1], TokenType.BackSlash, '\\')).toBe(true);
      expect(checkToken(line.tokens[2], TokenType.String, 'b')).toBe(true);
      expect(checkToken(line.tokens[3], TokenType.BackSlash, '\\')).toBe(true);
      expect(checkToken(line.tokens[4], TokenType.String, 'c')).toBe(true);
    });
    test('backslashes and double quotes', async () => {
      const line = TokenizeLine(1, encode('"a\\"b\\"c"'));
      expect(line.tokens.length).toBe(9);
      expect(checkToken(line.tokens[0], TokenType.DoubleQuote, '"')).toBe(true);
      expect(checkToken(line.tokens[1], TokenType.String, 'a')).toBe(true);
      expect(checkToken(line.tokens[2], TokenType.BackSlash, '\\')).toBe(true);
      expect(checkToken(line.tokens[3], TokenType.DoubleQuote, '"')).toBe(true);
      expect(checkToken(line.tokens[4], TokenType.String, 'b')).toBe(true);
      expect(checkToken(line.tokens[5], TokenType.BackSlash, '\\')).toBe(true);
      expect(checkToken(line.tokens[6], TokenType.DoubleQuote, '"')).toBe(true);
      expect(checkToken(line.tokens[7], TokenType.String, 'c')).toBe(true);
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
    test('1 string', async () => {
      const lines = await Tokenize(new StringReader('string'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'string')).toBe(true);
    });
    test('1 string, begins with linefeed', async () => {
      const lines = await Tokenize(new StringReader('\nstring'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(2);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'string')).toBe(true);
    });
    test('1 string, ends with linefeed', async () => {
      const lines = await Tokenize(new StringReader('string\n'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'string')).toBe(true);
    });
    test('1 string, begins and ends with linefeed', async () => {
      const lines = await Tokenize(new StringReader('\nstring\n'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(2);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'string')).toBe(true);
    });
    test('2 strings, 1 line', async () => {
      const lines = await Tokenize(new StringReader('string string'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(3);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'string')).toBe(true);
      expect(checkToken(lines[0].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[2], TokenType.String, 'string')).toBe(true);
    });
    test('3 strings, 1 line', async () => {
      const lines = await Tokenize(new StringReader('one two three'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(5);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'one')).toBe(true);
      expect(checkToken(lines[0].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[2], TokenType.String, 'two')).toBe(true);
      expect(checkToken(lines[0].tokens[3], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[4], TokenType.String, 'three')).toBe(true);
    });
    test('3 strings, 1 line, begins and ends with linefeed', async () => {
      const lines = await Tokenize(new StringReader('\none two three\n'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(2);
      expect(lines[0].tokens.length).toBe(5);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'one')).toBe(true);
      expect(checkToken(lines[0].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[2], TokenType.String, 'two')).toBe(true);
      expect(checkToken(lines[0].tokens[3], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[4], TokenType.String, 'three')).toBe(true);
    });
    test('1 string x 2 lines', async () => {
      const lines = await Tokenize(new StringReader('string\nstring'));
      expect(lines.length).toBe(2);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'string')).toBe(true);
      expect(lines[1].line_number).toBe(2);
      expect(lines[1].tokens.length).toBe(1);
      expect(checkToken(lines[1].tokens[0], TokenType.String, 'string')).toBe(true);
    });
    test('1 string x 3 lines', async () => {
      const lines = await Tokenize(new StringReader('one\ntwo\nthree'));
      expect(lines.length).toBe(3);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'one')).toBe(true);
      expect(lines[1].line_number).toBe(2);
      expect(lines[1].tokens.length).toBe(1);
      expect(checkToken(lines[1].tokens[0], TokenType.String, 'two')).toBe(true);
      expect(lines[2].line_number).toBe(3);
      expect(lines[2].tokens.length).toBe(1);
      expect(checkToken(lines[2].tokens[0], TokenType.String, 'three')).toBe(true);
    });
    test('1 string x 3 lines, begins and ends with linefeed', async () => {
      const lines = await Tokenize(new StringReader('\none\ntwo\nthree\n'));
      expect(lines.length).toBe(3);
      expect(lines[0].line_number).toBe(2);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'one')).toBe(true);
      expect(lines[1].line_number).toBe(3);
      expect(lines[1].tokens.length).toBe(1);
      expect(checkToken(lines[1].tokens[0], TokenType.String, 'two')).toBe(true);
      expect(lines[2].line_number).toBe(4);
      expect(lines[2].tokens.length).toBe(1);
      expect(checkToken(lines[2].tokens[0], TokenType.String, 'three')).toBe(true);
    });
    test('1 space x 2 lines', async () => {
      const lines = await Tokenize(new StringReader(' \n '));
      expect(lines.length).toBe(2);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(lines[1].line_number).toBe(2);
      expect(lines[1].tokens.length).toBe(1);
      expect(checkToken(lines[1].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
    });
    test('2 strings x 2 lines', async () => {
      const lines = await Tokenize(new StringReader('one two\nthree four'));
      expect(lines.length).toBe(2);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(3);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'one')).toBe(true);
      expect(checkToken(lines[0].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[0].tokens[2], TokenType.String, 'two')).toBe(true);
      expect(lines[1].line_number).toBe(2);
      expect(lines[1].tokens.length).toBe(3);
      expect(checkToken(lines[1].tokens[0], TokenType.String, 'three')).toBe(true);
      expect(checkToken(lines[1].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[1].tokens[2], TokenType.String, 'four')).toBe(true);
    });
    test('mix and match', async () => {
      const lines = await Tokenize(new StringReader('a\n lazy \ndog\nand \na quick\n fox\n \n \n'));
      expect(lines.length).toBe(8);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkToken(lines[0].tokens[0], TokenType.String, 'a')).toBe(true);
      expect(lines[1].line_number).toBe(2);
      expect(lines[1].tokens.length).toBe(3);
      expect(checkToken(lines[1].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[1].tokens[1], TokenType.String, 'lazy')).toBe(true);
      expect(checkToken(lines[1].tokens[2], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(lines[2].line_number).toBe(3);
      expect(lines[2].tokens.length).toBe(1);
      expect(checkToken(lines[2].tokens[0], TokenType.String, 'dog')).toBe(true);
      expect(lines[3].line_number).toBe(4);
      expect(lines[3].tokens.length).toBe(2);
      expect(checkToken(lines[3].tokens[0], TokenType.String, 'and')).toBe(true);
      expect(checkToken(lines[3].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(lines[4].line_number).toBe(5);
      expect(lines[4].tokens.length).toBe(3);
      expect(checkToken(lines[4].tokens[0], TokenType.String, 'a')).toBe(true);
      expect(checkToken(lines[4].tokens[1], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[4].tokens[2], TokenType.String, 'quick')).toBe(true);
      expect(lines[5].line_number).toBe(6);
      expect(lines[5].tokens.length).toBe(2);
      expect(checkToken(lines[5].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(checkToken(lines[5].tokens[1], TokenType.String, 'fox')).toBe(true);
      expect(lines[6].line_number).toBe(7);
      expect(lines[6].tokens.length).toBe(1);
      expect(checkToken(lines[6].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
      expect(lines[7].line_number).toBe(8);
      expect(lines[7].tokens.length).toBe(1);
      expect(checkToken(lines[7].tokens[0], TokenType.WhiteSpace, ' ')).toBe(true);
    });
  });
  describe('ParseLine', () => {
    test('empty', async () => {
      const line = ParseLine(1, EmptyUint8Array);
      expect(line.tokens.length).toBe(0);
    });
    test('comment without space', async () => {
      const line = ParseLine(1, encode('//this is a comment'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Comment, '//this is a comment')).toBe(true);
    });
    test('comment with space', async () => {
      const line = ParseLine(1, encode('// this is a comment'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Comment, '// this is a comment')).toBe(true);
    });
    test('comments must start at beginning of line', async () => {
      const line = ParseLine(1, encode('this // this is not a comment'));
      expect(line.tokens.length).toBeGreaterThan(0);
      expect(line.tokens.every((token) => token.type !== ParsedTokenType.Comment)).toBe(true);
    });
    test('1 string', async () => {
      const line = ParseLine(1, encode('string'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, 'string')).toBe(true);
    });
    test('2 strings', async () => {
      const line = ParseLine(1, encode('string string'));
      expect(line.tokens.length).toBe(2);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, 'string')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.String, 'string')).toBe(true);
    });
    test('1 quote, 1 string', async () => {
      const line = ParseLine(1, encode('"string"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'string')).toBe(true);
    });
    test('1 quote, 2 strings', async () => {
      const line = ParseLine(1, encode('"string string"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'string string')).toBe(true);
    });
    test('2 quotes, 1 string', async () => {
      const line = ParseLine(1, encode('"string" "string"'));
      expect(line.tokens.length).toBe(2);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'string')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.Quote, 'string')).toBe(true);
    });
    test('2 quotes, 2 strings', async () => {
      const line = ParseLine(1, encode('"string string" "string string"'));
      expect(line.tokens.length).toBe(2);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'string string')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.Quote, 'string string')).toBe(true);
    });
    test('long quote', async () => {
      const line = ParseLine(1, encode('"This is a quote!"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'This is a quote!')).toBe(true);
    });
    test('string quote', async () => {
      const line = ParseLine(1, encode('string "string"'));
      expect(line.tokens.length).toBe(2);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, 'string')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.Quote, 'string')).toBe(true);
    });
    test('quote string', async () => {
      const line = ParseLine(1, encode('"string" string'));
      expect(line.tokens.length).toBe(2);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'string')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.String, 'string')).toBe(true);
    });
    test('string quote string', async () => {
      const line = ParseLine(1, encode('string "string" string'));
      expect(line.tokens.length).toBe(3);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, 'string')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.Quote, 'string')).toBe(true);
      expect(checkParsedToken(line.tokens[2], ParsedTokenType.String, 'string')).toBe(true);
    });
    test('quote string quote', async () => {
      const line = ParseLine(1, encode('"string" string "string"'));
      expect(line.tokens.length).toBe(3);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'string')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.String, 'string')).toBe(true);
      expect(checkParsedToken(line.tokens[2], ParsedTokenType.Quote, 'string')).toBe(true);
    });
    test('1 backslash, alone', async () => {
      const line = ParseLine(1, encode('\\'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, '\\')).toBe(true);
    });
    test('1 backslash, after', async () => {
      const line = ParseLine(1, encode('a\\'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, 'a\\')).toBe(true);
    });
    test('1 backslash, before', async () => {
      const line = ParseLine(1, encode('\\b'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, '\\b')).toBe(true);
    });
    test('1 string, 1 backslash, between', async () => {
      const line = ParseLine(1, encode('a\\b'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, 'a\\b')).toBe(true);
    });
    test('2 backslashes, alone', async () => {
      const line = ParseLine(1, encode('\\ \\'));
      expect(line.tokens.length).toBe(2);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, '\\')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.String, '\\')).toBe(true);
    });
    test('1 string, 2 backslashes', async () => {
      const line = ParseLine(1, encode('a\\b\\c'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, 'a\\b\\c')).toBe(true);
    });
    test('2 strings, 2 backslashes', async () => {
      const line = ParseLine(1, encode('a\\b\\c 1\\2\\3'));
      expect(line.tokens.length).toBe(2);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.String, 'a\\b\\c')).toBe(true);
      expect(checkParsedToken(line.tokens[1], ParsedTokenType.String, '1\\2\\3')).toBe(true);
    });
    test('1 quote, 1 backslash, between', async () => {
      const line = ParseLine(1, encode('"a\\b"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'ab')).toBe(true);
    });
    test('1 quote, 1 escaped backslash, between', async () => {
      const line = ParseLine(1, encode('"a\\\\b"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'a\\b')).toBe(true);
    });
    test('1 quote, 2 escaped backslashes, between', async () => {
      const line = ParseLine(1, encode('"a\\\\\\\\b"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'a\\\\b')).toBe(true);
    });
    test('1 quote, 2 escaped backslashes, around', async () => {
      const line = ParseLine(1, encode('"\\\\ab\\\\"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, '\\ab\\')).toBe(true);
    });
    test('1 quote, 1 escaped doublequote, between', async () => {
      const line = ParseLine(1, encode('"a\\"b"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'a"b')).toBe(true);
    });
    test('1 quote, 2 escaped doublequotes, between', async () => {
      const line = ParseLine(1, encode('"a\\"\\"b"'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, 'a""b')).toBe(true);
    });
    test('1 quote, 2 escaped doublequotes, around', async () => {
      const line = ParseLine(1, encode('"\\"ab\\""'));
      expect(line.tokens.length).toBe(1);
      expect(checkParsedToken(line.tokens[0], ParsedTokenType.Quote, '"ab"')).toBe(true);
    });
  });
  describe('Parse', () => {
    test('empty', async () => {
      const lines = await Parse(new Uint8Reader(EmptyUint8Array));
      expect(lines.length).toBe(0);
    });
    test('only linefeed', async () => {
      const lines = await Parse(new StringReader('\n'));
      expect(lines.length).toBe(0);
    });
    test('1 string', async () => {
      const lines = await Parse(new StringReader('string'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkParsedToken(lines[0].tokens[0], ParsedTokenType.String, 'string')).toBe(true);
    });
    test('1 string, begins with linefeed', async () => {
      const lines = await Parse(new StringReader('\nstring'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(2);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkParsedToken(lines[0].tokens[0], ParsedTokenType.String, 'string')).toBe(true);
    });
    test('1 string, ends with linefeed', async () => {
      const lines = await Parse(new StringReader('string\n'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkParsedToken(lines[0].tokens[0], ParsedTokenType.String, 'string')).toBe(true);
    });
    test('1 string, begins and ends with linefeed', async () => {
      const lines = await Parse(new StringReader('\nstring\n'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(2);
      expect(lines[0].tokens.length).toBe(1);
      expect(checkParsedToken(lines[0].tokens[0], ParsedTokenType.String, 'string')).toBe(true);
    });
    test('copy "*" from "../project-lib" to "./lib"', async () => {
      const lines = await Parse(new StringReader('copy "*" from "../project-lib" to "./lib"'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(6);
      expect(checkParsedToken(lines[0].tokens[0], ParsedTokenType.String, 'copy')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[1], ParsedTokenType.Quote, '*')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[2], ParsedTokenType.String, 'from')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[3], ParsedTokenType.Quote, '../project-lib')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[4], ParsedTokenType.String, 'to')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[5], ParsedTokenType.Quote, './lib')).toBe(true);
    });
    test('when "../project-lib" is modified, doto copy-lib.doto', async () => {
      const lines = await Parse(new StringReader('when "../project-lib" is modified, doto copy-lib.doto'));
      expect(lines.length).toBe(1);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(6);
      expect(checkParsedToken(lines[0].tokens[0], ParsedTokenType.String, 'when')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[1], ParsedTokenType.Quote, '../project-lib')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[2], ParsedTokenType.String, 'is')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[3], ParsedTokenType.String, 'modified,')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[4], ParsedTokenType.String, 'doto')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[5], ParsedTokenType.String, 'copy-lib.doto')).toBe(true);
    });
    test('copy and when together', async () => {
      const lines = await Parse(new StringReader('copy "*" from "../project-lib" to "./lib"\nwhen "../project-lib" is modified, doto copy-lib.doto'));
      expect(lines.length).toBe(2);
      expect(lines[0].line_number).toBe(1);
      expect(lines[0].tokens.length).toBe(6);
      expect(checkParsedToken(lines[0].tokens[0], ParsedTokenType.String, 'copy')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[1], ParsedTokenType.Quote, '*')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[2], ParsedTokenType.String, 'from')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[3], ParsedTokenType.Quote, '../project-lib')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[4], ParsedTokenType.String, 'to')).toBe(true);
      expect(checkParsedToken(lines[0].tokens[5], ParsedTokenType.Quote, './lib')).toBe(true);
      expect(lines[1].tokens.length).toBe(6);
      expect(checkParsedToken(lines[1].tokens[0], ParsedTokenType.String, 'when')).toBe(true);
      expect(checkParsedToken(lines[1].tokens[1], ParsedTokenType.Quote, '../project-lib')).toBe(true);
      expect(checkParsedToken(lines[1].tokens[2], ParsedTokenType.String, 'is')).toBe(true);
      expect(checkParsedToken(lines[1].tokens[3], ParsedTokenType.String, 'modified,')).toBe(true);
      expect(checkParsedToken(lines[1].tokens[4], ParsedTokenType.String, 'doto')).toBe(true);
      expect(checkParsedToken(lines[1].tokens[5], ParsedTokenType.String, 'copy-lib.doto')).toBe(true);
    });
  });
});
