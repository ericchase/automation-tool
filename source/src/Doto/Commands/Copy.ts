import { Command } from '../Command/Command';
import { AssertArgCount, AssertArgValue } from '../Command/Validate';

export namespace CommandCopy {
  export function Validate(command: Command) {
    AssertArgCount({ command, count: 5 });
    AssertArgValue({ command, index: 1, value: 'from' });
    AssertArgValue({ command, index: 3, value: 'into' });
  }
  export function Process(command: Command) {
    // TODO:
  }
}
