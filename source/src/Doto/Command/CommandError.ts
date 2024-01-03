import { CommandTypeToString, ICommand } from './Command';

export class CommandError extends Error {
  constructor({ command, message }: { command: ICommand; message: string }) {
    super(message);
    this.command = command;
  }
  command: ICommand;
}
export class CommandException extends CommandError {
  constructor({ command, error }: { command: ICommand; error: string }) {
    super({ command, message: `Exception: ${error}` });
  }
}
export class UnknownCommandError extends CommandError {
  constructor({ command }: { command: ICommand }) {
    super({ command, message: 'Unknown command.' });
  }
}

export function PrettyFormatCommandError(err: CommandError) {
  return [
    `[File "${err.command.fileName}"] [Line ${err.command.lineNumber}] ${err.command.line}`, //
    `Error: Command "${CommandTypeToString(err.command.type)}": ${err.message}`,
  ].join('\n');
}
