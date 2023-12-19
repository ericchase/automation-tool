import { Command, notImplemented } from './Command.mjs';
import { CurrentDirectory } from './Doto.mjs';
import { Parser } from './Parser.mjs';
import { $asyncif, $loop, stdErr, stdOut } from './lib.mjs';
import { Reader } from './lib/Reader.mjs';
import { UseFileReader, dotoFileHandler, nonInteractiveCommandHandler, runFile } from './main.mjs';

const InteractiveCommandMap = new Map([
  ['help', CommandHelp], //
  ['version', CommandVersion],
  ['parse', CommandParse],
  ['check', CommandCheck],
]);

const NonInteractiveCommandMap = new Map([
  ['build', CommandBuild],
  ['doto', CommandDoto],
  ['run', CommandRun],
]);

/**
 * @typedef {(command:Command)=>Promise<*>} CommandHandler
 */

const HelpInfoMap = new Map([
  ['help', 'Print this message.'], //
  ['version', 'Print the version of this doto executable.'],
  ['parse', 'Print the results of parsing a <Doto_File>.'],
  ['check', 'Validate each <Doto_File> and their dependencies.'],
  ['copy', 'Copies file/s from <Folder>|<File>|<Glob> to <Folder>'],
]);

/** @type {CommandHandler} */
async function CommandHelp() {
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
  await UseFileReader(command.tokens[1], PrettyPrintParserOutput);
}

/** @type {CommandHandler} */
async function CommandCheck(command) {
  // TODO:
  notImplemented(command);
}

import { existsSync, lstatSync } from 'node:fs';

/** @type {CommandHandler} */
async function CommandBuild(command) {
  // build <Sub_Folder>
  console.log('CommandBuild', command.tokens);
  const sub_folder = command.tokens[1];
  if (existsSync(sub_folder) && lstatSync(sub_folder).isDirectory()) {
    console.log(`--- Start Command Build in "${sub_folder}" ---`);
    if (CurrentDirectory.pushSubdirectory(sub_folder)) {
      await dotoFileHandler.handleRequest(['build']);
      CurrentDirectory.pop();
    }

    // TODO: extract this to external api
    // const child = new Deno.Command('doto.exe', {
    //   args: ['build'],
    //   cwd: sub_folder,
    // });
    // await child.spawn();
    // await child.output();
    console.log('--- End Command Build ---');
  } else {
    // else print error
    // TODO: better error message
    stdErr('lmao yah fuxked <3 *p.s. go to @prodbybluezzi');
  }
}

/** @type {CommandHandler} */
async function CommandCopy(command) {
  // copy from <Folder> to <Folder>
  // copy from <Path> to <Folder>
  // copy from <Glob> to <Folder>
  // overwrite files
  // TODO:
  notImplemented(command);
}

/** @type {CommandHandler} */
async function CommandDoto(command) {
  // doto <Args>
  console.log('CommandDoto', command.tokens);
  await nonInteractiveCommandHandler.handleRequest(command.tokens.slice(1));
}

/** @type {CommandHandler} */
async function CommandRun(command) {
  // run <Path>
  // run <Shell_Command>
  // TODO:
  // should we show output from the program that ran?
  // what if they want to change the working directory?
  console.log('CommandRun', command.tokens);
  console.log('--- Start Command Run ---');
  await runFile(command.tokens[1], command.tokens.slice(2));
  console.log('--- End Command Run ---');
}

/** @type {CommandHandler} */
async function CommandWhen(command) {
  // when <Folder> is modified, doto <Command>|<Doto_File>
  // when <Path> is modified, doto <Command>|<Doto_File>
  // when <Glob> is modified, doto <Command>|<Doto_File>
  // the command may be any interactive/some non-interactive command
  // TODO:
  notImplemented(command);
}

/**
 * @param {Command} command
 */
export async function ProcessInteractiveCommand(command) {
  console.log('ProcessInteractiveCommand', command.tokens);
  return $asyncif(InteractiveCommandMap.get(command.name), async (fn) => await fn(command));
}
/**
 * @param {Command} command
 */
export async function ProcessNonInteractiveCommand(command) {
  console.log('ProcessNonInteractiveCommand', command.tokens);
  return $asyncif(NonInteractiveCommandMap.get(command.name), async (fn) => await fn(command));
}

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

/** @param {Reader} reader */
export function PrettyPrintParserOutput(reader) {
  const parser = new Parser(reader);

  $loop(
    () => parser.nextCommand(),
    (command) => command.tokens.length > 0,
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
