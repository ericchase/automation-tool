import { describe, expect, jest, test } from '@jest/globals';

import { Command, CommandType, CommandTypeToString, ICommand } from '../../../../automation-tool/build/Doto/Command/Command.js';
import { Process } from '../../../../automation-tool/build/Doto/Command/Process.js';

const encode = ((encoder) => encoder.encode.bind(encoder))(new TextEncoder());
const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

function encodeEach(arr: string[]) {
  return arr.map((str) => encode(str));
}

function ConcatByteArrays(u8Arrays: Uint8Array[]): Uint8Array {
  let outSize = 0;
  for (const u8 of u8Arrays) {
    outSize += u8.length;
  }
  const outBytes = new Uint8Array(outSize);
  let outOffset = 0;
  for (const u8 of u8Arrays) {
    outBytes.set(u8, outOffset);
    outOffset += u8.length;
  }
  return outBytes;
}

function buildCommand(type: CommandType, args: string[], lineNumber: number): ICommand {
  const encodedArgs = encodeEach(args);
  const line = ConcatByteArrays([encode(CommandTypeToString(type)), ...encodedArgs]);
  return new Command(type, encodedArgs, 'Test', lineNumber, line);
}

describe('Process Command', () => {
  test('version', () => {
    const logs: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((...args: any) => {
      logs.push(args.join(' '));
    });
    const commands: ICommand[] = [buildCommand(CommandType.Version, [], 1)];
    Process(commands);
    expect(logs).toEqual(['0.0.1']);
    spy.mockRestore();
  });
});
