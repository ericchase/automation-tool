import { Uint8Reader, Uint8Type, Uint8View, Uint8ViewCompare, Uint8ViewConcat } from '../Uint8.js';
import {
  IParsedLine,
  IParsedToken,
  IToken,
  ITokenizedLine,
  ParsedLine,
  ParsedToken,
  ParsedTokenType,
  NOP,
  Token,
  TokenType,
  TokenizedLine,
  Uint8ToTokenType,
} from './Token.js';

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

export function TokenizeLine(lineNumber: number, lineBuffer: Uint8Array): ITokenizedLine {
  const tokens: IToken[] = [];

  for (let i = 0; i < lineBuffer.byteLength; i++) {
    const tokenType = Uint8ToTokenType(lineBuffer[i]);

    switch (tokenType) {
      case TokenType.BackSlash:
      case TokenType.DoubleQuote:
        tokens.push(new Token(tokenType, new Uint8View(lineBuffer, i, i + 1)));
        break;
      case TokenType.String:
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

export function ParseLine(lineNumber: number, lineBuffer: Uint8Array): IParsedLine {
  const line = TokenizeLine(lineNumber, lineBuffer);
  const tokens: IParsedToken[] = [];

  (() => {
    // empty line
    if (line.tokens.length === 0) {
      return;
    }

    // comment
    if (line.tokens[0].view.length >= 2) {
      const token = line.tokens[0];
      if (Uint8ViewCompare(token.view.newEnd(2), new Uint8View(new Uint8Array([Uint8Type.Slash, Uint8Type.Slash])))) {
        const views = line.tokens.map((token) => token.view);
        tokens.push(new ParsedToken(ParsedTokenType.Comment, Uint8ViewConcat(views)));
        return;
      }
    }

    // TODO:
    // parse
    for (let i = 0; i < line.tokens.length; i++) {
      const token = line.tokens[i];
      const tokenType = line.tokens[i].type;

      switch (tokenType) {
        case TokenType.BackSlash:
          (() => {
            const prev = (() => {
              const t = tokens.pop();
              if (t && t.type !== ParsedTokenType.String) {
                // push back into tokens array
                tokens.push(t);
                return undefined;
              }
              return t;
            })();
            const next = (() => {
              const t = line.tokens[i + 1];
              if (t && t.type !== TokenType.String) {
                return undefined;
              }
              // skip next token
              i++;
              return t;
            })();
            if (prev && next) {
              tokens.push(new ParsedToken(ParsedTokenType.String, Uint8ViewConcat([prev.view, token.view, next.view])));
            } else if (prev) {
              tokens.push(new ParsedToken(ParsedTokenType.String, Uint8ViewConcat([prev.view, token.view])));
            } else if (next) {
              tokens.push(new ParsedToken(ParsedTokenType.String, Uint8ViewConcat([token.view, next.view])));
            } else {
              tokens.push(new ParsedToken(ParsedTokenType.String, token.view));
            }
          })();
          break;
        case TokenType.DoubleQuote:
          (() => {
            const views: Uint8View[] = [];
            let escaped = false;
            OUT: for (i++; i < line.tokens.length; i++) {
              const token = line.tokens[i];
              const tokenType = line.tokens[i].type;
              switch (escaped) {
                case false:
                  switch (tokenType) {
                    case TokenType.BackSlash:
                      escaped = true;
                      break;
                    case TokenType.DoubleQuote:
                      break OUT;
                    case TokenType.String:
                    case TokenType.WhiteSpace:
                      views.push(token.view);
                      break;
                  }
                  break;
                case true:
                  escaped = false;
                  switch (tokenType) {
                    case TokenType.BackSlash:
                    case TokenType.DoubleQuote:
                    case TokenType.String:
                    case TokenType.WhiteSpace:
                      views.push(token.view);
                      break;
                  }
                  break;
              }
            }
            tokens.push(new ParsedToken(ParsedTokenType.Quote, Uint8ViewConcat(views)));
          })();
          break;
        case TokenType.String:
          tokens.push(new ParsedToken(ParsedTokenType.String, token.view));
          break;
        case TokenType.WhiteSpace:
          tokens.push(NOP);
          break;
      }
    }
  })();

  return new ParsedLine(
    line.line_number,
    tokens.filter((token) => token !== NOP),
  );
}

export async function Parse(reader: Uint8Reader): Promise<IParsedLine[]> {
  const lines: IParsedLine[] = [];
  await ApplyToLines(reader, async (lineNumber: number, lineBuffer: Uint8Array) => {
    const parsedLine = ParseLine(lineNumber, lineBuffer);
    if (parsedLine.tokens.length > 0) {
      lines.push(parsedLine);
    }
  });
  return lines;
}
