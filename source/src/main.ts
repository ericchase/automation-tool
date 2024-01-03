// import { Parse } from './Parser.mts';
// import { TokenLine } from './Token.mts';
// import { Tokenize } from './Tokenizer.mts';
import { GetArgs } from './external.js';
// import { UseAsyncFileReader } from './external/node/FileReader.mts';
// import { stdOut } from './lib.mjs';
// import { Byte } from './lib/Byte.mts';

// new HandlerChain([
//   interactiveCommandHandler, //
//   dotoFileHandler,
//   helpHandler,
// ]).handle(GetArgs());

// export class InteractiveCommandHandler extends Handler<string[]> {
//   async handleRequest(this: InteractiveCommandHandler, args: string[]) {
//     //console.log('InteractiveCommandHandler:', args);
//     const tokenFile = Parse(new StringReader(args.join(' ')));
//     if (Validate(tokenFile)) {
//       // const command = parser.nextCommand();
//       // return ProcessInteractiveCommand(command);
//     }
//   }
// }

const encode = ((encoder) => encoder.encode.bind(encoder))(new TextEncoder());
const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

function areEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }
  const length = a.length;
  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function compareStrU8(a: string, b: Uint8Array) {
  return areEqual(encode(a), b);
}

class InvalidCommandError extends Error {
  constructor(message: string) {
    super(message);
  }
}

interface Command {
  name: Uint8Array;
  args: Uint8Array;
}

function ParseCommandLine(commandLine: string) {
  const commands: Command[] = [];
  return commands;
}
function ValidateCommandsOrThrow(commands: Command[]) {
  for (const command of commands) {
    if (compareStrU8('help', command.name)) {
      if (command.args.length === 0) {
        continue;
      }
      throw new InvalidCommandError(`Command "${command.name}" Must Have 0 Arguments`);
    }
    throw new InvalidCommandError(`Command "${command.name}" Not Found`);
  }
  return true;
}
function ProcessCommands(commands: Command[]) {}

// function ProcessCommandLine() {
//   try {
//     const args = GetArgs();
//     const commandLine = args.join(' ');
//     const commands: Command[] = ParseCommandLine(commandLine);
//     ValidateCommandsOrThrow(commands);
//     ProcessCommands(commands);
//   } catch (err) {
//     if (err instanceof InvalidCommandError) {
//       console.log(err);
//     } else {
//       throw err;
//     }
//   }
// }

// await UseAsyncFileReader(GetArgs()[0], async (reader: Byte.AsyncReader) => {
//   const tokenFile = await Parse(reader);

//   const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

//   for (const tokenLine of tokenFile.lines) {
//     if (tokenLine !== TokenLine.EOF) {
//       const a = tokenLine.tokens.map((token) => decode(token.view.toBytes()));
//       const b = a.map((text) => '='.repeat(text.length));
//       stdOut(`Line ${tokenLine.lineNumber}:`, decode(tokenLine.lineView.toBytes()));
//       stdOut('╔' + b.join('╦') + '╗');
//       stdOut('║' + a.join('║') + '║');
//       stdOut('╚' + b.join('╩') + '╝');
//       stdOut();
//     }
//   }
// });
