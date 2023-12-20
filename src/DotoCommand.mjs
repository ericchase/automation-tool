import { Command, notImplemented } from './Command.mjs';
import { dotoFileHandler, nonInteractiveCommandHandler } from './Doto.mjs';
import { Parser } from './Parser.mjs';
import { CopyFolder, CurrentDirectory, Run, UseFileReader } from './external.mjs';
import { $asyncif, $loop, stdOut, stdOutNewlineOnce } from './lib.mjs';
import { Reader } from './lib/Reader.mjs';

const InteractiveCommandMap = new Map([
  ['help', CommandHelp], //
  ['version', CommandVersion],
  ['parse', CommandParse],
  ['check', CommandCheck],
]);

const NonInteractiveCommandMap = new Map([
  ['build', CommandBuild],
  ['copy', CommandCopy],
  ['doto', CommandDoto],
  ['run', CommandRun],
  ['when', CommandWhen],
]);

/**
 * @typedef {(command:Command)=>Promise<*>} CommandHandler
 */

const HelpInfoMap = new Map([
  ['help', 'Print this message.'], //
  ['version', 'Print the version of this doto executable.'],
  ['parse', 'Print the results of parsing a <Doto_File>.'],
  ['check', 'Validate each <Doto_File> and their dependencies.'],
  ['copy', 'Copies file/s from <Directory>|<File>|<Glob> to <Directory>'],
]);

/** @type {CommandHandler} */
async function CommandHelp() {
  // TODO: rewrite this whole thing
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
  const commandColumnSize = Math.max(...[...HelpInfoMap.keys()].map((command) => command.length));
  for (const [key, value] of HelpInfoMap) {
    stdOut(key.padEnd(commandColumnSize), '|', value);
  }
  stdOut();
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

/** @type {CommandHandler} */
async function CommandVersion() {
  stdOut('0.0.1');
}

/** @type {CommandHandler} */
async function CommandParse(command) {
  stdOut(`Doto Parse "${command.tokens[1]}"`);

  await UseFileReader(command.tokens[1], PrettyPrintParserOutput);
}

/** @type {CommandHandler} */
async function CommandCheck(command) {
  stdOut(`Doto Check "${command.tokens[1]}"`);

  // TODO:
  notImplemented(command);
}

/** @type {CommandHandler} */
async function CommandBuild(command) {
  const subDirectory = command.tokens[1];
  stdOut(`Doto Build "${subDirectory}"`);
  if (CurrentDirectory.pushSubdirectory(command.tokens[1])) {
    try {
      await dotoFileHandler.handleRequest(['build']);
    } catch (err) {
      throw err;
    } finally {
      CurrentDirectory.pop();
    }
  }
}

/** @type {CommandHandler} */
async function CommandCopy(command) {
  stdOut(`Doto Copy ${command.tokens.slice(1).join(' ')}`);
  if (command.tokens[2] === 'from' && command.tokens[4] === 'into') {
    const glob = command.tokens[1];
    const from = command.tokens[3];
    const to = command.tokens[5];
    await CopyFolder(glob, from, to);
  } else {
    throw 'Invalid Syntax for Copy';
  }
}

/** @type {CommandHandler} */
async function CommandDoto(command) {
  // Do not log this command, as it would be redundant.
  await nonInteractiveCommandHandler.handleRequest(command.tokens.slice(1));
}

/** @type {CommandHandler} */
async function CommandRun(command) {
  stdOut(`Doto Run "${command.tokens.slice(1).join(' ')}"`);

  await Run(command.tokens[1], command.tokens.slice(2));
}

/** @type {CommandHandler} */
async function CommandWhen(command) {
  stdOut(`Doto When ${command.tokens.slice(1).join(' ')}`);

  // TODO:
  // the command may be any interactive/some non-interactive command
  notImplemented(command);
}

/**
 * @param {Command} command
 */
export async function ProcessInteractiveCommand(command) {
  return $asyncif(InteractiveCommandMap.get(command.name), async (fn) => {
    await fn(command);
    stdOutNewlineOnce();
  });
}
/**
 * @param {Command} command
 */
export async function ProcessNonInteractiveCommand(command) {
  return $asyncif(NonInteractiveCommandMap.get(command.name), async (fn) => {
    await fn(command);
    stdOutNewlineOnce();
  });
}

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

/** @param {Reader} reader */
export function PrettyPrintParserOutput(reader) {
  const parser = new Parser(reader);

  $loop(
    () => parser.nextCommand(),
    (command) => command !== Parser.EOF,
    (command, index) => {
      const texts = command.tokens;
      const hbars = texts.map((token) => '═'.repeat(token.length));
      stdOut(`Line ${index + 1}:`, decode(command.buffer));
      stdOut('╔' + hbars.join('╦') + '╗');
      stdOut('║' + texts.join('║') + '║');
      stdOut('╚' + hbars.join('╩') + '╝');
      stdOut();
    },
  );
}
