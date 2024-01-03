import { Token, TokenFile } from './Token.mts';
import { AsyncLineProvider, Byte } from './lib/Byte.mts';

export async function Tokenize(reader: Byte.AsyncReader): Promise<TokenFile> {
  const tokenFile = new TokenFile([]);
  const lineProvider = new AsyncLineProvider(reader);
  while (true) {
    const lineView = await lineProvider.next();
    if (lineView === Byte.View.EOF) {
      break;
    }
    const view = new Byte.View(lineView.toPrintableBytes());
    const tokens = pass1(view);
    tokenFile.addLine(tokens, view);
  }
  tokenFile.addEOF();
  return tokenFile;
}

function getTokenTypeAtOffset(view: Byte.View, offset: number): Token.Type {
  if (offset < view.start || offset >= view.end) {
    return Token.Type.Null;
  }
  switch (view.contents[offset]) {
    case Byte.Type.Backslash:
      return Token.Type.BackSlash;
    case Byte.Type.DoubleQuote:
      return Token.Type.DoubleQuote;
    case Byte.Type.Tab:
    case Byte.Type.LF:
    case Byte.Type.FF:
    case Byte.Type.CR:
    case Byte.Type.Space:
      return Token.Type.WhiteSpace;
    default:
      return Token.Type.Glyph;
  }
}

function pass1(view: Byte.View): Token[] {
  if (view.length <= 0) {
    return [];
  }
  if (view.length === 1) {
    return [new Token(getTokenTypeAtOffset(view, view.start), view)];
  }

  // combine chain of whitespace characters into single token
  // combine chain of non-whitespace characters into single token
  let head = view.start;
  let headType = getTokenTypeAtOffset(view, head);
  const ranges: [Token.Type, number, number][] = [[headType, head, head + 1]];
  for (let tail = head + 1; tail < view.end; tail++) {
    const tailType = getTokenTypeAtOffset(view, tail);
    if (
      tailType === Token.Type.BackSlash ||
      tailType === Token.Type.DoubleQuote ||
      tailType !== headType //
    ) {
      head = tail;
      headType = tailType;
      ranges.push([headType, head, head + 1]);
    } else {
      ranges[ranges.length - 1][2]++;
    }
  }
  const tokens: Token[] = [];
  for (const [type, start, end] of ranges) {
    tokens.push(new Token(type, new Byte.View(view.contents, start, end)));
  }
  return tokens;
}
