import { Byte } from './Byte.mts';

export class StringReader extends Byte.Reader {
  constructor(string: string) {
    super(new TextEncoder().encode(string));
  }
}
