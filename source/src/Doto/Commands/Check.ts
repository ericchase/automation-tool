import { Command } from '../Command/Command';
import { AssertArgCount } from '../Command/Validate';

export namespace CommandCheck {
  export function Validate(command: Command) {
    AssertArgCount({ command, count: 1 });
  }
  export function Process(command: Command) {
    // TODO:
  }
}
