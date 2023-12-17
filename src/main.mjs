// External
import { getArg } from './external/deno/Argv.mjs';
import { FileReader, UseFileReader } from './external/node/FileReader.mjs';

// Internal
import { Handler, HandlerChain } from './ChainOfResponsibility.mjs';

/** @extends {Handler<string[]>} */
class InteractiveCommandHandler extends Handler {
  /**
   * @param {(string|undefined)[]} request
   * @returns {boolean}
   */
  handleRequest([command, args]) {
    if (command !== undefined) {
      HandleInteractiveCommand(command, args);
      return true;
    }
    return false;
  }
}

/** @extends {Handler<string[]>} */
class DotoFileHandler extends Handler {
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
      console.log(`Could not find "${filename}" in current directory.`);
    }
    return false;
  }
}

new HandlerChain([
  new InteractiveCommandHandler(), //
  new DotoFileHandler(),
]).handle([getArg(0) ?? 'help', getArg(1)]);

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

/**
 * @param {FileReader} fileReader
 */
function ProcessDotoFile(fileReader) {
  console.log('Processing', fileReader.filepath);
  console.log();
  const tokenizer = new Tokenizer(fileReader);
  let [tokens, buffer] = tokenizer.nextLine();
  while (tokens.length > 0) {
    let str = '';
    for (const token of tokens) {
      str += decode(token);
    }
    console.log(str);
    [tokens, buffer] = tokenizer.nextLine();
  }
}
