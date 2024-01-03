import { Handler } from './ChainOfResponsibility2.mts';
import { Parse } from './Parser.mts';
import { StringReader } from './lib/StringReader.mts';

import { CurrentDirectory, FileReader, IsFileInCurrentDirectory, UseFileReader } from './external.mjs';
import { stdErr } from './lib.mjs';

/**
 * Interactive commands are entered into the terminal by a user (usually human),
 * and follow directly after the executing program's name (Doto in this case).
 */
export class InteractiveCommandHandler extends Handler<string[]> {
  async handleRequest(this: InteractiveCommandHandler, args: string[]) {
    //console.log('InteractiveCommandHandler:', args);
    const tokenFile = Parse(new StringReader(args.join(' ')));
    if (Validate(tokenFile)) {
      // const command = parser.nextCommand();
      // return ProcessInteractiveCommand(command);
    }
  }
}

/**
 * Non-interactive commands are usually read from a file or passed through via
 * the executing program itself (Doto in this case).
 */
export class NonInteractiveCommandHandler extends Handler<string[]> {
  async handleRequest(this: NonInteractiveCommandHandler, args: string[]) {
    //console.log('NonInteractiveCommandHandler:', args);
    const tokenFile = Parse(new StringReader(args.join(' ')));
    if (Validate(tokenFile)) {
      // const command = parser.nextCommand();
      // return ProcessNonInteractiveCommand(command);
    }
  }
}

/**
 * If the program input could not be parsed into a valid command, then it will
 * be processed as a Doto input file, instead.
 */
export class DotoFileHandler extends Handler<string[]> {
  async handleRequest(this: DotoFileHandler, [filename]: string[]) {
    //console.log('DotoFileHandler:', filename);
    if (filename !== undefined) {
      if (!filename.endsWith('.doto')) filename += '.doto';
      if (IsFileInCurrentDirectory(filename)) {
        return UseFileReader(filename, ProcessDotoFile, () => {
          stdErr(`Could not find the file "${filename}" in directory "${CurrentDirectory.get()}".`);
        });
      } else {
        stdErr(`"${filename}" is outside of directory "${CurrentDirectory.get()}".`);
        return true;
      }
    }
    return false;
  }
}

/**
 * If all else fails, show the Doto help info.
 */
export class HelpHandler extends Handler<string[]> {
  async handleRequest(this: HelpHandler) {
    //console.log('HelpHandler');
    const tokenFile = Parse(new StringReader('help'));
    if (Validate(tokenFile)) {
      // const command = parser.nextCommand();
      // return ProcessInteractiveCommand(command);
    }
  }
}

async function ProcessDotoFile(reader: FileReader) {
  //console.log('ProcessDotoFile:', reader.filepath);
  const tokenFile = Parse(reader);
  if (Validate(tokenFile)) {
    // const command = parser.nextCommand();
    // return ProcessNonInteractiveCommand(command);
  }

  // let lineNumber = 1;
  // try {
  //   await $asyncloop(
  //     async () => parser.nextCommand(),
  //     async (command) => command !== Parser.EOF,
  //     async (command) => {
  //       await ProcessNonInteractiveCommand(command);
  //       lineNumber++;
  //     },
  //   );
  // } catch (err) {
  //   stdErr(`[Line ${lineNumber}]`, err);
  // }
}

export const interactiveCommandHandler = new InteractiveCommandHandler();
export const nonInteractiveCommandHandler = new NonInteractiveCommandHandler();
export const dotoFileHandler = new DotoFileHandler();
export const helpHandler = new HelpHandler();
