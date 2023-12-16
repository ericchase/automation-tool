import { FileReader, UseFileReader } from './external/node/FileReader.mjs';
import { Parser } from './src/Parser.mjs';
import { Tokenizer } from './src/Tokenizer.mjs';

// come up with language
// help
// build: searches for build.do files, and runs them
// copy: copies files in one folder into the other
// run?: run external program?
// watch: watch a directory for file changes, then execute next steps

/**
 * A tokenizer breaks a stream of text into tokens, usually by looking for
 * whitespace (tabs, spaces, new lines).
 *
 * A lexer is basically a tokenizer, but it usually attaches extra context to
 * the tokens -- this token is a number, that token is a string literal, this
 * other token is an equality operator.
 *
 * A parser takes the stream of tokens from the lexer and turns it into an
 * abstract syntax tree representing the (usually) program represented by the
 * original text.
 */

/**
 * @typedef Command
 * @property {string} command_name
 * @property {()=>void} command_function
 */

// help message prompt
function help() {
  console.log('-----------------------------------------------------');
  console.log('HELP:');
  console.log('-----------------------------------------------------');
  console.log('help     | This is where you currently are!');
  console.log('version  | Print current version of do.');
  console.log('parse    | Print the results of parsing a *.do file.');
  console.log('validate | Validate a *.do file and its dependencies.');
  console.log('-----------------------------------------------------');
}

//
//

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

/**
 * Non-interactive commands are those parsed from *.do files. They cannot be
 * triggered directly in the terminal by a user.
 * @param {string} command
 */
function ProcessCommand(command) {
  // Non-interactive Commands
  switch (command) {
    case 'build':
      // build <subfolder>
      // run build.do file in target subfolder
      return true;
    case 'copy':
      // copy from <file> to <folder>
      // copy from <folder> to <folder>
      // copy from <glob> to <folder>
      // overwrites files
      return true;
    case 'do':
      // do <*.do>
      // processes target file as if ran with do directly
      return true;
    case 'run':
      // run <executable>
      // run <shell command>
      return true;
    case 'watch':
      // watch <file> <command>
      // watch <folder> <command>
      // watch <glob> <command>
      // the command may be any interactive/some non-interactive command
      return true;
  }
  return false;
}

/**
 * @param {FileReader} fileReader
 */
function ProcessFile(fileReader) {
  console.log('Processing', fileReader.filepath);
  console.log();
  const tokenizer = new Tokenizer(fileReader);
  let [tokens, buffer] = tokenizer.nextLine();
  while (tokens.length > 0) {
    let str = '';
    for (const buffer of tokens) {
      str += decode(buffer);
    }
    console.log(str);
    [tokens, buffer] = tokenizer.nextLine();
  }
}

/**
 * @param {FileReader} fileReader
 */
function ParseFile(fileReader) {
  // TODO: use the lexer instead of tokenizer
  console.log('Parsing', fileReader.filepath);
  console.log();
  const parser = new Parser(fileReader);
  var { tokens, buffer } = parser.nextCommand(); // deal with var later
  let line_count = 0;
  while (tokens.length > 0) {
    line_count += 1;
    const texts = tokens;
    const hbars = texts.map((token) => '═'.repeat(token.length));
    console.log(`Line ${line_count}:`, decode(buffer));
    console.log('╔' + hbars.join('╦') + '╗');
    console.log('║' + texts.join('║') + '║');
    console.log('╚' + hbars.join('╩') + '╝');
    console.log();
    var { tokens, buffer } = parser.nextCommand();
  }
}

/**
 * Interactive commands are those entered into the terminal directly by a user.
 * The token immediately following "do" will be processed as an interactive
 * command. If the token is not reserved as an interactive command below, then
 * it will processed as a *.do filename, instead.
 * @param {string} command
 */
function ProcessInteractiveCommand(command) {
  switch (command) {
    case 'help':
      // prints information about how to use do
      help();
      return true;
    case 'version':
      // prints version of do
      console.log('0.0.1');
      return true;
    case 'parse':
      // parses a file and prints each resulting line of lexemes
      if (process.argv[3] !== undefined) {
        ProcessFilename(process.argv[3], ParseFile);
      } else {
        console.log('Please provide a filepath to parse.');
      }
      return true;
    case 'validate':
      // validates every *.do file in the current directory and any *.do files might be called during execution
      return true;
    case 'run':
      // run <executable>
      // run <shell command>
      return true;
  }
  return false;
}

/**
 * If the token immediately following "do" cannot be processed as an interactive
 * command, then it will processed as a *.do filename, instead.
 * @param {string} filename
 * @param {(fileReader: FileReader) => void} callback
 */
function ProcessFilename(filename, callback) {
  // look for <filename> file in current directory
  if (!UseFileReader(filename, callback)) {
    return true;
  }
  // if not found, look for  <filename>.do file in current directory
  if (!UseFileReader(filename + '.do', callback)) {
    return true;
  }
  // if not found, console.error does not exist
  console.log(`Could not find "${filename}" or "${filename}.do" in current directory.`);
  return false;
}

/**
 * Chain of Responsibility
 * @typedef {function(string): boolean} Handler
 * @type {Handler[]}
 */
const handlers = [
  ProcessInteractiveCommand, //
  (filename) => ProcessFilename(filename, ProcessFile),
];
for (const handler of handlers) {
  if (handler(process.argv[2]) === true) {
    break;
  }
}
