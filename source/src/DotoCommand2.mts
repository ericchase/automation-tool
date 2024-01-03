import { Command, notImplemented as NotImplemented } from './Command.mts';
import { Parse } from './Parser.mts';
import { Token, TokenLine } from './Token.mts';
import { CopyFolder, CurrentDirectory, Run } from './external.mts';
import { UseAsyncFileReader } from './external/node/FileReader.mts';
import { Byte } from './lib/Byte.mts';

import { $asyncif, stdOut, stdOutNewlineOnce } from './lib.mjs';

type CommandHandler = (tokens: string[], validate: boolean) => any;

const InteractiveCommandMap = new Map<string, CommandHandler>([
  ['help', CommandHelp], //
  ['version', CommandVersion],
  ['parse', CommandParse],
  ['check', CommandCheck],
]);

const NonInteractiveCommandMap = new Map<string, CommandHandler>([
  ['build', CommandBuild],
  ['copy', CommandCopy],
  ['doto', CommandDoto],
  ['run', CommandRun],
  ['when', CommandWhen],
]);

async function CommandBuild(tokens: string[], validate = false) {
  const subDirectory = tokens[1].toString();
  stdOut(`Doto Build "${subDirectory}"`);
  if (CurrentDirectory.pushSubdirectory(tokens[1].toString())) {
    try {
      await dotoFileHandler.handleRequest(['build']);
    } catch (err) {
      throw err;
    } finally {
      CurrentDirectory.pop();
    }
  }
}

async function CommandCopy(tokens: string[], validate = false) {
  stdOut(`Doto Copy ${command.tokens.slice(1).join(' ')}`);
  if (command.tokens[2] === 'from' && command.tokens[4] === 'into') {
    const glob = tokens[1].toString();
    const from = command.tokens[3];
    const to = command.tokens[5];
    await CopyFolder(glob, from, to);
  } else {
    throw 'Invalid Syntax for Copy';
  }
}

async function CommandDoto(tokens: string[], validate = false) {
  // Do not log this command, as it would be redundant.
  await nonInteractiveCommandHandler.handleRequest(command.tokens.slice(1));
}

async function CommandRun(tokens: string[], validate = false) {
  stdOut(`Doto Run "${command.tokens.slice(1).join(' ')}"`);

  await Run(tokens[1].toString(), command.tokens.slice(2));
}

async function CommandWhen(tokens: string[], validate = false) {
  stdOut(`Doto When ${command.tokens.slice(1).join(' ')}`);

  // TODO:
  // the command may be any interactive/some non-interactive command
  NotImplemented(command);
}

export async function ProcessInteractiveCommand(tokenLine: TokenLine, validate = false): Promise<boolean> {
  return await $asyncif(InteractiveCommandMap.get(command.name), async (fn) => {
    await fn(command, validate);
    stdOutNewlineOnce();
  });
}
export async function ProcessNonInteractiveCommand(tokenLine: TokenLine, validate = false): Promise<boolean> {
  return await $asyncif(NonInteractiveCommandMap.get(command.name), async (fn) => {
    await fn(command, validate);
    stdOutNewlineOnce();
  });
}

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

export async function PrettyPrintParserOutput(reader: Byte.AsyncReader) {
  const tokenFile = await Parse(reader);

  for (const tokenLine of tokenFile.lines) {
    if (tokenLine !== TokenLine.EOF) {
      const t = tokenLine.tokens.map((token) => decode(token.view.toBytes()));
      const b = t.map((text) => '='.repeat(text.length));
      stdOut(`Line ${tokenLine.lineNumber}:`, decode(tokenLine.lineView.toBytes()));
      stdOut('╔' + b.join('╦') + '╗');
      stdOut('║' + t.join('║') + '║');
      stdOut('╚' + b.join('╩') + '╝');
      stdOut();
    }
  }
}
