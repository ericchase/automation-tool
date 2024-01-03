import { Command } from '../Command/Command';
import { AssertArgCount } from '../Command/Validate';
import { stdOut } from '../Lib.js';

const HelpInfoMap = new Map<string, string>([
  ['help', 'Print this message.'], //
  ['version', 'Print the version of this doto executable.'],
  ['parse', 'Print the results of parsing a <Doto_File>.'],
  ['check', 'Validate each <Doto_File> and their dependencies.'],
  ['copy', 'Copies file/s from <Directory>|<File>|<Glob> to <Directory>'],
]);

export namespace CommandHelp {
  export function Validate(command: Command) {
    AssertArgCount({ command, count: 0 });
  }
  export function Process(command: Command) {
    stdOut('Doto Help');
    stdOut();
    stdOut('Usage: doto <Command>|<Doto_File> [<Doto_File>|<File>]');
    stdOut();
    stdOut(`Examples
      doto check build.doto
      doto build.doto
      doto build
    `);
    stdOut('Command');
    stdOut(`<Doto_File>
      A *.doto filepath that resides in the current directory. The ".doto" file
      extension is optional.
    `);
    stdOut(`<File>
      Any filepath that points to an executable file.
    `);
    stdOut(`<Shell_Command>
      A string that represents a shell command. Surround with double quotes "" if
      spaces are necessary, ie: "echo hello world". Use \\" to include double quotes
      within a quoted shell command, ie: "echo \\"hello world\\"".
    `);
  }
}
