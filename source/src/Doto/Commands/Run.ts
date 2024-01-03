import { Command } from '../Command/Command';
import { AssertArgCount } from '../Command/Validate';

export namespace CommandRun {
  export function Validate(command: Command) {
    AssertArgCount({ command, count: 2 });
  }
  export function Process(command: Command) {
    // TODO:
  }
}
