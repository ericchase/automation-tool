import { Token, TokenFile, TokenLine } from './Token.mts';
import { Tokenize } from './Tokenizer.mts';
import { Byte } from './lib/Byte.mts';

export async function Parse(reader: Byte.AsyncReader): Promise<TokenFile> {
  const tokenFile: TokenFile = await Tokenize(reader);
  for (const tokenLine of tokenFile.lines) {
    if (tokenLine !== TokenLine.EOF) {
      pass['mark literal tokens'](tokenLine);
      pass['combine adjacent literal tokens'](tokenLine);
      pass['combine adjacent glyph and backslash tokens'](tokenLine);
      pass['convert glyph and literal type to string type'](tokenLine);
      discard(Token.Type.WhiteSpace, tokenLine);
    }
  }
  return tokenFile;
}

const pass = {
  'mark literal tokens': markLiteralTokens,
  'combine adjacent literal tokens': combineAdjacentLiteralTokens,
  'combine adjacent glyph and backslash tokens': combineAdjacentGlyphAndBackslashTokens,
  'convert glyph and literal type to string type': convertGlyphAndLiteralTypeToStringType,
};

function markLiteralTokens(line: TokenLine): void {
  let inQuote = false;
  let escapeNext = false;
  for (let index = 0; index < line.tokens.length; index++) {
    switch (inQuote) {
      case true:
        switch (escapeNext) {
          case true:
            escapeNext = false;
            switch (line.tokens[index].type) {
              case Token.Type.BackSlash:
              case Token.Type.DoubleQuote:
                line.tokens[index - 1].type = Token.Type.Null;
                line.tokens[index].type = Token.Type.Literal;
                break;
              default:
                line.tokens[index].type = Token.Type.Literal;
                break;
            }
            break;
          case false:
            switch (line.tokens[index].type) {
              case Token.Type.BackSlash:
                escapeNext = true;
                break;
              case Token.Type.DoubleQuote:
                inQuote = false;
                line.tokens[index].type = Token.Type.Null;
                break;
              default:
                line.tokens[index].type = Token.Type.Literal;
                break;
            }
            break;
        }
        break;
      case false:
        switch (line.tokens[index].type) {
          case Token.Type.DoubleQuote:
            inQuote = true;
            line.tokens[index].type = Token.Type.Null;
            break;
        }
        break;
    }
  }
  discard(Token.Type.Null, line);
}

function combineAdjacentLiteralTokens(line: TokenLine): void {
  if (line.tokens.length < 2) {
    return;
  }
  let head = 0;
  let headType = line.tokens[head].type;
  const ranges: [number, number][] = [[head, head + 1]];
  for (let tail = head + 1; tail < line.tokens.length; tail++) {
    const tailType = line.tokens[tail].type;
    if (
      headType === Token.Type.Literal &&
      tailType === Token.Type.Literal //
    ) {
      ranges[ranges.length - 1][1]++;
    } else {
      head = tail;
      headType = tailType;
      ranges.push([head, head + 1]);
    }
  }
  for (const [start, end] of ranges) {
    if (end - start > 1) {
      combineTokens(line, start, end);
    }
  }
  discard(Token.Type.Null, line);
}

function combineAdjacentGlyphAndBackslashTokens(line: TokenLine): void {
  if (line.tokens.length < 2) {
    return;
  }
  let head = 0;
  let headType = line.tokens[head].type;
  const ranges: [number, number][] = [[head, head + 1]];
  for (let tail = head + 1; tail < line.tokens.length; tail++) {
    const tailType = line.tokens[tail].type;
    if (
      (headType === Token.Type.BackSlash || headType === Token.Type.Glyph) &&
      (tailType === Token.Type.BackSlash || tailType === Token.Type.Glyph) //
    ) {
      ranges[ranges.length - 1][1]++;
    } else {
      head = tail;
      headType = tailType;
      ranges.push([head, head + 1]);
    }
  }
  for (const [start, end] of ranges) {
    if (end - start > 1) {
      combineTokens(line, start, end);
      line.tokens[start].type = Token.Type.Glyph;
    }
  }
  discard(Token.Type.Null, line);
}

function convertGlyphAndLiteralTypeToStringType(line: TokenLine): void {
  for (const token of line.tokens) {
    switch (token.type) {
      case Token.Type.Glyph:
      case Token.Type.Literal:
        token.type = Token.Type.String;
        break;
    }
  }
}

function combineTokens(line: TokenLine, start: number, end: number): void {
  // bounds check
  if (start >= 0) {
    if (end <= line.tokens.length) {
      // cannot merge a single token
      if (end - start > 1) {
        // merge tokens into first token, set others to null type
        const [head, ...rest] = line.tokens.slice(start, end);
        const views = [head.view];
        for (const token of rest) {
          token.type = Token.Type.Null;
          views.push(token.view);
        }
        head.view = Byte.View.Concat(views);
      }
    }
  }
}

function discard(discardType: Token.Type, line: TokenLine): void {
  const tokens: Token[] = [];
  for (const token of line.tokens) {
    if (token.type !== discardType) {
      tokens.push(token);
    }
  }
  line.tokens = tokens;
}
