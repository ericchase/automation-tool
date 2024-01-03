import { Uint8Reader, Uint8Type, Uint8View } from '../Uint8.js';
import { IToken, Token, TokenType, Uint8ToTokenType } from './Token.js';

export interface IParsedLine {
  lineNumber: number;
  tokens: IToken[];
}

export class ParsedLine implements IParsedLine {
  constructor(
    public lineNumber: number,
    public tokens: IToken[],
  ) {}
}

export async function TokenizeLine(buffer: Uint8Array): Promise<IToken[]> {
  const tokens: IToken[] = [];

  for (let i = 0; i < buffer.byteLength; i++) {
    const tokenType = Uint8ToTokenType(buffer[i]);

    switch (tokenType) {
      case TokenType.BackSlash:
      case TokenType.DoubleQuote:
        tokens.push(new Token(tokenType, new Uint8View(buffer, i, i + 1)));
        break;
      case TokenType.Glyph:
      case TokenType.WhiteSpace:
        {
          const start = i;
          for (; i < buffer.byteLength; i++) {
            if (i + 1 === buffer.byteLength || Uint8ToTokenType(buffer[i + 1]) !== tokenType) {
              tokens.push(new Token(tokenType, new Uint8View(buffer, start, i + 1)));
              break;
            }
          }
        }
        break;
    }
  }

  return tokens;
}

export async function Tokenize(reader: Uint8Reader): Promise<IParsedLine[]> {
  const parsedLines: IParsedLine[] = [];
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
          parsedLines.push(new ParsedLine(lineNumber, await TokenizeLine(lineBuffer)));
        }
        lineStart = lineEnd + 1;
        lineNumber++;
      }
    }
    buffer.copyWithin(0, lineStart, lineEnd);
    bufferLength = lineEnd - lineStart;
  }

  return parsedLines;
}

async function Parse(reader: Uint8Reader) {
  //
}
