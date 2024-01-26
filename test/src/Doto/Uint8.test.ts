import { describe, expect, test } from '@jest/globals';
test('canary', () => expect(true).toBe(true));

import { Uint8View, Uint8ViewCompare } from '../../../source/build/Doto/Uint8.js';

const encode = ((encoder) => encoder.encode.bind(encoder))(new TextEncoder());
const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

function encodeEach(arr: string[]) {
  return arr.map((str) => encode(str));
}

describe('Uint8ViewCompare', () => {
  test('returns true for same view (empty)', () => {
    const view = new Uint8View(new Uint8Array());
    expect(Uint8ViewCompare(view, view)).toBe(true);
  });
  test('returns true for same view (1 byte)', () => {
    const view = new Uint8View(encode('a'));
    expect(Uint8ViewCompare(view, view)).toBe(true);
  });
  test('returns true for same view (2 bytes)', () => {
    const view = new Uint8View(encode('ab'));
    expect(Uint8ViewCompare(view, view)).toBe(true);
  });
  test('returns true for same bytes (1 byte)', () => {
    const bytes = encode('a');
    const view1 = new Uint8View(bytes);
    const view2 = new Uint8View(bytes);
    expect(Uint8ViewCompare(view1, view2)).toBe(true);
  });
  test('returns true for same bytes (2 bytes)', () => {
    const bytes = encode('ab');
    const view1 = new Uint8View(bytes);
    const view2 = new Uint8View(bytes);
    expect(Uint8ViewCompare(view1, view2)).toBe(true);
  });
  test('returns true if content ranges are equal', () => {
    const view1 = new Uint8View(encode('ab12'), 0, 2);
    const view2 = new Uint8View(encode('12ab'), 2, 4);
    expect(Uint8ViewCompare(view1, view2)).toBe(true);
  });
});
