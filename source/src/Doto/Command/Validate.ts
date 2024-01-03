import { CommandType, ICommand } from './Command';
import { CommandError, CommandException } from './CommandError';

// Commands
import { CommandBuild } from '../Commands/Build.js';
import { CommandCheck } from '../Commands/Check.js';
import { CommandCopy } from '../Commands/Copy.js';
import { CommandDoto } from '../Commands/Doto.js';
import { CommandHelp } from '../Commands/Help.js';
import { CommandParse } from '../Commands/Parse.js';
import { CommandRun } from '../Commands/Run.js';
import { CommandVersion } from '../Commands/Version.js';
import { CommandWhen } from '../Commands/When.js';

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

export function AssertArgCount({ command, count }: { command: ICommand; count: number }): void {
  if (command.args.length !== count) {
    throw new CommandError({ command, message: `Expected ${count} arguments.` });
  }
}

export function AssertArgValue({ command, index, value }: { command: ICommand; index: number; value: string }): void {
  const arg = decode(command.args[index]);
  if (arg !== value) {
    throw new CommandError({ command, message: `Expected "${arg}" to be "${value}".` });
  }
}

export function AssertArgIsDotoFile({ command, index }: { command: ICommand; index: number }): void {
  // TODO:
}

export function Validate(commands: ICommand[]): true | CommandError[] {
  const errors: CommandError[] = [];
  for (const command of commands) {
    try {
      switch (command.type) {
        case CommandType.Build:
          CommandBuild.Validate(command);
          break;
        case CommandType.Check:
          CommandCheck.Validate(command);
          break;
        case CommandType.Copy:
          CommandCopy.Validate(command);
          break;
        case CommandType.Doto:
          CommandDoto.Validate(command);
          break;
        case CommandType.Help:
          CommandHelp.Validate(command);
          break;
        case CommandType.Parse:
          CommandParse.Validate(command);
          break;
        case CommandType.Run:
          CommandRun.Validate(command);
          break;
        case CommandType.Version:
          CommandVersion.Validate(command);
          break;
        case CommandType.When:
          CommandWhen.Validate(command);
          break;
      }
    } catch (err) {
      if (err instanceof CommandError) {
        errors.push(err);
      } else {
        errors.push(new CommandException({ command, error: `${err}` }));
      }
    }
  }
  return errors.length > 0 ? errors : true;
}
