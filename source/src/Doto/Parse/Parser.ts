import { Uint8Reader, Uint8Type, Uint8View } from '../Uint8.js';
import { IToken, Token, TokenType, Uint8ToTokenType } from './Token.js';

export async function ApplyToLines(reader: Uint8Reader, fn: (lineNumber: number, lineBuffer: Uint8Array) => Promise<void>): Promise<void> {
  let lineNumber = 1;
  const buffer = new Uint8Array(65536);
  let bufferLength = 0;
  while (true) {
    const bytesRead = await reader.read(buffer, bufferLength);
    bufferLength += bytesRead;

    if (bytesRead <= 0) {
      if (bufferLength <= 0) {
        break;
      }
      if (bufferLength >= 65536) {
        throw 'Error: Internal buffer too small to hold next line.';
      }
      buffer[bufferLength] = Uint8Type.LF;
      bufferLength++;
    }

    let lineStart = 0;
    let lineEnd = lineStart;
    for (; lineEnd < bufferLength; lineEnd++) {
      if (buffer[lineEnd] === Uint8Type.LF) {
        if (lineEnd - lineStart > 0) {
          const lineBuffer = new Uint8View(buffer, lineStart, lineEnd).toBytes();
          await fn(lineNumber, lineBuffer);
        }
        lineStart = lineEnd + 1;
        lineNumber++;
      }
    }
    buffer.copyWithin(0, lineStart, lineEnd);
    bufferLength = lineEnd - lineStart;
  }
}

export interface ITokenizedLine {
  number: number;
  tokens: IToken[];
}

export class TokenizedLine implements ITokenizedLine {
  constructor(
    public number: number,
    public tokens: IToken[],
  ) {}
}

export function TokenizeLine(lineNumber: number, lineBuffer: Uint8Array): ITokenizedLine {
  const tokens: IToken[] = [];

  for (let i = 0; i < lineBuffer.byteLength; i++) {
    const tokenType = Uint8ToTokenType(lineBuffer[i]);

    switch (tokenType) {
      case TokenType.BackSlash:
      case TokenType.DoubleQuote:
        tokens.push(new Token(tokenType, new Uint8View(lineBuffer, i, i + 1)));
        break;
      case TokenType.Glyph:
      case TokenType.WhiteSpace:
        {
          const start = i;
          for (; i < lineBuffer.byteLength; i++) {
            if (i + 1 === lineBuffer.byteLength || Uint8ToTokenType(lineBuffer[i + 1]) !== tokenType) {
              tokens.push(new Token(tokenType, new Uint8View(lineBuffer, start, i + 1)));
              break;
            }
          }
        }
        break;
    }
  }

  return new TokenizedLine(lineNumber, tokens);
}

export async function Tokenize(reader: Uint8Reader): Promise<ITokenizedLine[]> {
  const lines: ITokenizedLine[] = [];
  await ApplyToLines(reader, async (lineNumber: number, lineBuffer: Uint8Array) => {
    const tokenizedLine = TokenizeLine(lineNumber, lineBuffer);
    if (tokenizedLine.tokens.length > 0) {
      lines.push(tokenizedLine);
    }
  });
  return lines;
}

export interface IParsedLine {
  number: number;
  tokens: IToken[];
}

export class ParsedLine implements IParsedLine {
  constructor(
    public number: number,
    public tokens: IToken[],
  ) {}
}

export function ParseLine(line: ITokenizedLine): IParsedLine {
  // TODO:
  return new ParsedLine(line.number, line.tokens);
}

export async function Parse(reader: Uint8Reader): Promise<IParsedLine[]> {
  const lines: IParsedLine[] = [];
  await ApplyToLines(reader, async (lineNumber: number, lineBuffer: Uint8Array) => {
    const parsedLine = ParseLine(TokenizeLine(lineNumber, lineBuffer));
    if (parsedLine.tokens.length > 0) {
      lines.push(parsedLine);
    }
  });
  return lines;
}
