import { StringToUint8View, Uint8Type, Uint8View, Uint8ViewEOF } from '../Uint8';

export enum TokenType {
  BackSlash,
  DoubleQuote,
  LineFeed,
  String,
  WhiteSpace,
}

export function Uint8ToTokenType(u8: number) {
  switch (u8) {
    case Uint8Type.Backslash:
      return TokenType.BackSlash;
    case Uint8Type.DoubleQuote:
      return TokenType.DoubleQuote;
    default:
      return TokenType.String;
    case Uint8Type.CR:
    case Uint8Type.FF:
    case Uint8Type.Space:
    case Uint8Type.Tab:
      return TokenType.WhiteSpace;
    case Uint8Type.LF:
      return TokenType.LineFeed;
  }
}

export function TokenTypeToString(type: TokenType) {
  switch (type) {
    case TokenType.BackSlash:
      return 'BackSlash';
    case TokenType.DoubleQuote:
      return 'DoubleQuote';
    case TokenType.LineFeed:
      return 'LineFeed';
    case TokenType.String:
      return 'String';
    case TokenType.WhiteSpace:
      return 'WhiteSpace';
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

export interface ITokenizedLine {
  line_number: number;
  tokens: IToken[];
}

export class TokenizedLine implements ITokenizedLine {
  constructor(
    public line_number: number,
    public tokens: IToken[],
  ) {}
}

export enum ParsedTokenType {
  NOP,
  Comment,
  Quote,
  String,
}

export function ParsedTokenTypeToString(type: ParsedTokenType) {
  switch (type) {
    case ParsedTokenType.NOP:
      return 'NOP';
    case ParsedTokenType.Comment:
      return 'Comment';
    case ParsedTokenType.Quote:
      return 'Quote';
    case ParsedTokenType.String:
      return 'String';
  }
}

export interface IParsedToken {
  type: ParsedTokenType;
  view: Uint8View;
}

export class ParsedToken implements IParsedToken {
  constructor(
    public type: ParsedTokenType,
    public view: Uint8View,
  ) {}
}

export interface IParsedLine {
  line_number: number;
  tokens: IParsedToken[];
}

export class ParsedLine implements IParsedLine {
  constructor(
    public line_number: number,
    public tokens: IParsedToken[],
  ) {}
}

export const NOP = new ParsedToken(ParsedTokenType.NOP, StringToUint8View(' '));
