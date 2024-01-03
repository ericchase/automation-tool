import { CommandType, ICommand } from './Command.js';
import { CommandError, CommandException } from './CommandError.js';

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

export function Process(commands: ICommand[]): void {
  for (const command of commands) {
    try {
      switch (command.type) {
        case CommandType.Build:
          CommandBuild.Process(command);
          break;
        case CommandType.Check:
          CommandCheck.Process(command);
          break;
        case CommandType.Copy:
          CommandCopy.Process(command);
          break;
        case CommandType.Doto:
          CommandDoto.Process(command);
          break;
        case CommandType.Help:
          CommandHelp.Process(command);
          break;
        case CommandType.Parse:
          CommandParse.Process(command);
          break;
        case CommandType.Run:
          CommandRun.Process(command);
          break;
        case CommandType.Version:
          CommandVersion.Process(command);
          break;
        case CommandType.When:
          CommandWhen.Process(command);
          break;
      }
    } catch (err) {
      if (err instanceof CommandError) {
        throw err;
      } else {
        throw new CommandException({ command, error: `${err}` });
      }
    }
  }
}
