import { Byte } from './lib/Byte.mts';

class CToken {
  constructor(
    public type: Token.Type,
    public view: Byte.View,
  ) {}

  toBytes(this: CToken): Uint8Array {
    return this.view.toBytes();
  }
  toPrintableBytes(this: CToken): Uint8Array {
    return this.view.toPrintableBytes();
  }
  toString(this: CToken): string {
    return this.view.toString();
  }

  assert(this: CToken, utf8: string): boolean {
    return this.view.toString().toLowerCase() === utf8.toLowerCase();
  }

  typeString(this: CToken) {
    switch (this.type) {
      case Token.Type.Null:
        return 'Null';
      case Token.Type.BackSlash:
        return 'BackSlash';
      case Token.Type.DoubleQuote:
        return 'DoubleQuote';
      case Token.Type.Glyph:
        return 'Glyph';
      case Token.Type.Literal:
        return 'Literal';
      case Token.Type.WhiteSpace:
        return 'WhiteSpace';
      case Token.Type.EOF:
        return 'EOF';
    }
  }
}

export namespace Token {
  export function New(a: { type: Token.Type; view: Byte.View }) {
    return new CToken(a.type, a.view);
  }
  export function NewLine(a: { line_number: number; view: Byte.View }) {}
  export function NewFile() {}

  export enum Type {
    Null,
    BackSlash,
    DoubleQuote,
    Glyph,
    Literal,
    WhiteSpace,
    String,
    EOF,
  }

  export const EOF = New({ type: Token.Type.EOF, view: Byte.View.EOF });
}

class CTokenLine {
  constructor(
    public lineNumber: number,
    public tokens: CToken[],
    public lineView: Byte.View,
  ) {}

  toStrings(this: CTokenLine) {
    const strings = [];
    for (const token of this.tokens) {
      strings.push(token.toString());
    }
    return strings;
  }

  static EOF = new CTokenLine(-1, [Token.EOF], Byte.View.EOF);
}

class CTokenFile {
  constructor(public lines: CTokenLine[]) {}

  addLine(this: CTokenFile, tokens: CToken[], lineView: Byte.View) {
    this._lineCount++;
    this.lines.push(new CTokenLine(this._lineCount, tokens, lineView));
  }

  addEOF() {
    this.lines.push(CTokenLine.EOF);
  }

  get lineCount() {
    return this.lines.length;
  }

  private _lineCount = 0;
}
