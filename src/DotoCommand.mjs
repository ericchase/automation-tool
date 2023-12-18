import { Command } from './Command.mjs';
import { Parser } from './Parser.mjs';
import { UseFileReader } from './external/node/FileReader.mjs';
import { $if, stdOut } from './lib.mjs';
import { Reader } from './lib/Reader.mjs';

/**
 * @typedef {(command:Command)=>void} CommandHandler
 */

const HelpInfoMap = new Map([
  ['help', 'Print this message.'], //
  ['version', 'Print the version of this doto executable.'],
  ['parse', 'Print the results of parsing a <Doto_File>.'],
  ['check', 'Validate each <Doto_File> and their dependencies.'],
]);

const HelpCommandInfoMap = new Map([
  ['run', 'Run a <Path> or <Shell_Command>.'], //
]);

/** @type {CommandHandler} */
function CommandHelp() {
  stdOut('Usage: doto <Command>|<Doto_File> [<Doto_File>|<Path>|<Shell_Command>]');
  stdOut();
  stdOut(`Examples
  doto check build.doto
  doto build.doto
  doto build
  `);
  stdOut('Command');
  const commandColumnSize = Math.max(...[...HelpInfoMap.keys()].map((command) => command.length));
  for (const [key, value] of HelpInfoMap) {
    stdOut(key.padEnd(commandColumnSize), '|', value);
  }
  stdOut();
  stdOut(`Doto_File
  A *.doto filepath that resides in the current directory. The ".doto" file
  extension is optional.
  `);
  stdOut(`Path
  Any filepath that points to an executable file.
  `);
  stdOut(`Shell_Command
  A string that represents a shell command. Surround with double quotes "" if
  spaces are necessary, ie: "echo hello world". Use \\" to include double quotes
  within a quoted shell command, ie: "echo \\"hello world\\"".
  `);
}

/** @type {CommandHandler} */
function CommandVersion() {
  stdOut('0.0.1');
}

/** @type {CommandHandler} */
function CommandParse(command) {
  UseFileReader(command.tokens[1], PrettyPrintParserOutput);
}

/** @type {CommandHandler} */
function CommandCheck(command) {
  throw 'not implemented';
}

/** @type {CommandHandler} */
function CommandBuild(commandObject) {
  // build <Sub_Folder>
  // run build.doto file in target subfolder
  throw 'not implemented';
}

/** @type {CommandHandler} */
function CommandCopy(commandObject) {
  // copy from <Folder> to <Folder>
  // copy from <Path> to <Folder>
  // copy from <Glob> to <Folder>
  // overwrite files
  throw 'not implemented';
}

/** @type {CommandHandler} */
function CommandDoto(commandObject) {
  // doto <Doto_File>
  // processes target file as if ran with doto directly
  throw 'not implemented';
}

/** @type {CommandHandler} */
function CommandRun(commandObject) {
  // run <Path>
  // run <Shell_Command>
  throw 'not implemented';
}

/** @type {CommandHandler} */
function CommandWhen(commandObject) {
  // when <Folder> is modified, doto <Command>|<Doto_File>
  // when <Path> is modified, doto <Command>|<Doto_File>
  // when <Glob> is modified, doto <Command>|<Doto_File>
  // the command may be any interactive/some non-interactive command
  throw 'not implemented';
}

const CommandMap = new Map([
  ['help', CommandHelp], //
  ['version', CommandVersion],
  ['parse', CommandParse],
  ['check', CommandCheck],
  ['build', CommandBuild],
  ['copy', CommandCopy],
  ['doto', CommandDoto],
  ['run', CommandRun],
  ['when', CommandWhen],
]);

/**
 * @param {Command} command
 */
export function ProcessCommand(command) {
  return $if(CommandMap.get(command.name), (fn) => fn(command));
}

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

/** @param {Reader} reader */
export function PrettyPrintParserOutput(reader) {
  const parser = new Parser(reader);
  let command = parser.nextCommand(); // deal with var later
  let line_count = 0;
  while (command.tokens.length > 0) {
    line_count += 1;
    const texts = command.tokens;
    const hbars = texts.map((token) => '═'.repeat(token.length));
    stdOut(`Line ${line_count}:`, decode(command.buffer));
    stdOut('╔' + hbars.join('╦') + '╗');
    stdOut('║' + texts.join('║') + '║');
    stdOut('╚' + hbars.join('╩') + '╝');
    stdOut();
    command = parser.nextCommand();
  }
}
