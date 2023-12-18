import { Handler } from './ChainOfResponsibility.mjs';
import { PrettyPrintParserOutput, ProcessCommand } from './DotoCommand.mjs';
import { Parser } from './Parser.mjs';
import { FileReader, UseFileReader } from './external/node/FileReader.mjs';
import { stdOut } from './lib.mjs';
import { StringReader } from './lib/StringReader.mjs';

/** @extends {Handler<string[]>} */
export class CommandHandler extends Handler {
  /**
   * Interactive commands are those entered into the terminal directly by a user.
   * The token immediately following "doto" will be processed as an interactive
   * command. If the token is not reserved as an interactive command below, then
   * it will processed as a *.doto filename, instead.
   * @param {(string|undefined)[]} request
   * @returns {boolean}
   */
  handleRequest([arg0, arg1]) {
    const commandLine = [arg0 ?? '', arg1 ?? ''] //
      .filter((part) => typeof part === 'string')
      .filter((part) => part.length > 0)
      .join(' ');
    const parser = new Parser(new StringReader(commandLine));
    const command = parser.nextCommand();
    return ProcessCommand(command);
  }
}

/** @extends {Handler<string[]>} */
export class DotoFileHandler extends Handler {
  /**
   * @param {(string|undefined)[]} request
   * @returns {boolean}
   */
  handleRequest([filename]) {
    if (filename !== undefined) {
      if (!filename.endsWith('.doto')) filename += '.doto';
      // TODO: look for <Doto_File> in current directory only
      if (UseFileReader(filename, ProcessDotoFile)) {
        return true;
      }
      stdOut(`Could not find "${filename}" in current directory.`);
    }
    return false;
  }
}

/** @param {FileReader} fileReader */
function ProcessDotoFile(fileReader) {
  stdOut('Processing', fileReader.filepath);
  stdOut();
  PrettyPrintParserOutput(fileReader);
}
