import { Handler } from './ChainOfResponsibility.mjs';
import { ProcessInteractiveCommand, ProcessNonInteractiveCommand } from './DotoCommand.mjs';
import { Parser } from './Parser.mjs';
import { CurrentDirectory, FileReader, UseFileReader } from './external.mjs';
import { $asyncloop, stdErr } from './lib.mjs';
import { StringReader } from './lib/StringReader.mjs';

/** @typedef {(request:string[])=>Promise<boolean>} HandleRequest */

/** @extends {Handler<string[]>} */
export class InteractiveCommandHandler extends Handler {
  /**
   * Interactive commands are those entered into the terminal directly by a user.
   * The token immediately following "doto" will be processed as an interactive
   * command. If the token is not reserved as an interactive command below, then
   * it will processed as a *.doto filename, instead.
   * @this {InteractiveCommandHandler}
   * @type {HandleRequest}
   */
  async handleRequest(args) {
    // console.log('InteractiveCommandHandler:', args);
    const parser = new Parser(new StringReader(args.join(' ')));
    const command = parser.nextCommand();
    return ProcessInteractiveCommand(command);
  }
}

/** @extends {Handler<string[]>} */
export class NonInteractiveCommandHandler extends Handler {
  /**
   * Interactive commands are those entered into the terminal directly by a user.
   * The token immediately following "doto" will be processed as an interactive
   * command. If the token is not reserved as an interactive command below, then
   * it will processed as a *.doto filename, instead.
   * @this {NonInteractiveCommandHandler}
   * @type {HandleRequest}
   */
  async handleRequest(args) {
    // console.log('NonInteractiveCommandHandler:', args);
    const parser = new Parser(new StringReader(args.join(' ')));
    const command = parser.nextCommand();
    return ProcessNonInteractiveCommand(command);
  }
}

/** @extends {Handler<string[]>} */
export class DotoFileHandler extends Handler {
  /**
   * @this {DotoFileHandler}
   * @type {HandleRequest}
   */
  async handleRequest([filename]) {
    // console.log('DotoFileHandler:', filename);
    if (filename !== undefined) {
      if (!filename.endsWith('.doto')) filename += '.doto';
      // TODO: look for <Doto_File> in current directory only
      return UseFileReader(filename, ProcessDotoFile, () => {
        stdErr(`Could not find the file "${filename}" in directory "${CurrentDirectory.get()}".`);
      });
    }
    return false;
  }
}

/** @param {FileReader} reader */
async function ProcessDotoFile(reader) {
  // console.log('ProcessDotoFile:', reader.filepath);
  const parser = new Parser(reader);

  await $asyncloop(
    async () => parser.nextCommand(),
    async (command) => command.tokens.length > 0,
    async (command) => await ProcessNonInteractiveCommand(command),
  );
}

/** @extends {Handler<string[]>} */
export class HelpHandler extends Handler {
  /**
   * At this point, no previous handlers have succeeded. Show the help info.
   * @type {HandleRequest}
   */
  async handleRequest() {
    // console.log('HelpHandler');
    const parser = new Parser(new StringReader('help'));
    const command = parser.nextCommand();
    return ProcessInteractiveCommand(command);
  }
}

export const interactiveCommandHandler = new InteractiveCommandHandler();
export const nonInteractiveCommandHandler = new NonInteractiveCommandHandler();
export const dotoFileHandler = new DotoFileHandler();
export const helpHandler = new HelpHandler();
