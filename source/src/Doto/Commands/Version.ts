import { Command } from '../Command/Command';
import { AssertArgCount } from '../Command/Validate';
import { stdOut } from '../Lib.js';

export namespace CommandVersion {
  export function Validate(command: Command) {
    AssertArgCount({ command, count: 0 });
  }
  export function Process(command: Command) {
    stdOut('0.0.1');
  }
}
