import { Command } from '../Command/Command';
import { AssertArgCount, AssertArgValue } from '../Command/Validate';

export namespace CommandWhen {
  export function Validate(command: Command) {
    AssertArgCount({ command, count: 5 });
    AssertArgValue({ command, index: 1, value: 'is' });
    AssertArgValue({ command, index: 2, value: 'modified,' });
    AssertArgValue({ command, index: 3, value: 'doto' });
  }
  export function Process(command: Command) {
    // TODO:
  }
}
