import { describe, expect, test } from '@jest/globals';
test('canary', () => expect(true).toBe(true));

import { Command, CommandType, CommandTypeToString, ICommand } from '../../../../source/build/Doto/Command/Command.js';
import { CommandError, PrettyFormatCommandError } from '../../../../source/build/Doto/Command/CommandError.js';
import { Validate } from '../../../../source/build/Doto/Command/Validate.js';

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

describe('Command Validate', () => {
  describe('help/version', () => {
    test('proper form passes', () => {
      const commands: ICommand[] = [
        buildCommand(CommandType.Help, [], 1), //
        buildCommand(CommandType.Version, [], 2),
      ];
      const received = Validate(commands);
      expect(received).toBe(true);
    });
    test('prints malformed commands', () => {
      const commands: ICommand[] = [
        buildCommand(CommandType.Help, ['extraneous argument'], 1), //
        buildCommand(CommandType.Version, ['extraneous argument'], 2),
      ];
      const result = Validate(commands);
      const received = result === true ? true : result.map((err) => PrettyFormatCommandError(err));
      const expected = commands.map((command) => PrettyFormatCommandError(new CommandError({ command, message: `Expected 0 arguments.` })));
      expect(received).toEqual(expected);
    });
  });
  describe('build/check/doto/parse', () => {
    test('proper form passes', () => {
      const commands: ICommand[] = [
        buildCommand(CommandType.Build, ['<Sub_Directory>'], 1), //
        buildCommand(CommandType.Check, ['<Doto_File>'], 2),
        buildCommand(CommandType.Doto, ['<Doto_File>'], 3),
        buildCommand(CommandType.Parse, ['<Doto_File>'], 4),
      ];
      const received = Validate(commands);
      expect(received).toBe(true);
    });
    test('prints malformed commands', () => {
      const commands: ICommand[] = [
        buildCommand(CommandType.Build, ['this', 'file'], 1), //
        buildCommand(CommandType.Check, ['file1', 'and', 'file2'], 2),
        buildCommand(CommandType.Doto, [], 3),
        buildCommand(CommandType.Parse, ['la', 'la', 'la'], 4),
      ];
      const result = Validate(commands);
      const received = result === true ? true : result.map((err) => PrettyFormatCommandError(err));
      const expected = commands.map((command) => PrettyFormatCommandError(new CommandError({ command, message: `Expected 1 arguments.` })));
      expect(received).toEqual(expected);
    });
  });
});
