import { Command } from '../Command/Command';
import { AssertArgCount, AssertArgIsDotoFile } from '../Command/Validate';

export namespace CommandDoto {
  export function Validate(command: Command) {
    AssertArgCount({ command, count: 1 });
    AssertArgIsDotoFile({ command, index: 0 });
  }
  export function Process(command: Command) {
    // TODO:
  }
}
