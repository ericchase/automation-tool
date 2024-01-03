import { Uint8Type, Uint8View, Uint8ViewEOF } from '../Uint8';

export enum TokenType {
  BackSlash,
  DoubleQuote,
  Glyph,
  WhiteSpace,
  LineFeed,
}

export function TokenTypeToString(type: TokenType) {
  switch (type) {
    case TokenType.BackSlash:
      return 'BackSlash';
    case TokenType.DoubleQuote:
      return 'DoubleQuote';
    case TokenType.Glyph:
      return 'Glyph';
    case TokenType.WhiteSpace:
      return 'WhiteSpace';
    case TokenType.LineFeed:
      return 'LineFeed';
  }
}

export interface IToken {
  type: TokenType;
  view: Uint8View;
}

export class Token implements IToken {
  constructor(
    public type: TokenType,
    public view: Uint8View,
  ) {}
}

// export const TokenEOF = new Token(TokenType.EOF, Uint8ViewEOF);

export function Uint8ToTokenType(u8: number) {
  switch (u8) {
    case Uint8Type.Backslash:
      return TokenType.BackSlash;
    case Uint8Type.DoubleQuote:
      return TokenType.DoubleQuote;
    default:
      return TokenType.Glyph;
    case Uint8Type.CR:
    case Uint8Type.FF:
    case Uint8Type.Space:
    case Uint8Type.Tab:
      return TokenType.WhiteSpace;
    case Uint8Type.LF:
      return TokenType.LineFeed;
  }
}
