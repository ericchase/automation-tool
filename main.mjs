import { FileReader, UseFileReader } from './external/node/FileReader.mjs';
import { $if } from './lib/lib.mjs';
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

const decode = ((decoder) => decoder.decode.bind(decoder))(new TextDecoder());

/**
 * @param {FileReader} fileReader
 */
function ProcessDoFile(fileReader) {
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

const CommandMap = new Map([
  ['build', CommandBuild], //
  ['copy', CommandCopy],
  ['do', CommandDo],
  ['run', CommandExecute],
  ['when', CommandWatch],
]);
/**
 * Non-interactive commands are those parsed from *.do files. They cannot be
 * triggered directly in the terminal by a user.
 * @param {string} command
 */
function ProcessCommand(command) {
  return $if(InteractiveCommandMap.get(command), (fn) => fn());

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
    case 'when':
      // watch <file> <command>
      // watch <folder> <command>
      // watch <glob> <command>
      // the command may be any interactive/some non-interactive command
      return true;
  }
  return false;
}
function CommandBuild() {
  // build <subfolder>
  // run build.do file in target subfolder
}
function CommandCopy() {
  // copy from <file> to <folder>
  // copy from <folder> to <folder>
  // copy from <glob> to <folder>
  // overwrites files?
}
function CommandDo() {}
function CommandWatch() {
  // watch <file> <command>
  // watch <folder> <command>
  // watch <glob> <command>
  // the command may be any interactive/some non-interactive command
}

const InteractiveCommandMap = new Map([
  ['help', ShowHelp], // print help information
  ['version', ShowVersion], // print installed version of do
  ['parse', PrintParse], // parse a do file and print each line of tokens
  ['check', CommandValidate], // validate each do file and their dependencies in current folder
  ['run', CommandExecute], // run executable file or shell command
]);
/**
 * Interactive commands are those entered into the terminal directly by a user.
 * The token immediately following "do" will be processed as an interactive
 * command. If the token is not reserved as an interactive command below, then
 * it will processed as a *.do filename, instead.
 * @param {string} command
 * @param {string=} filepath
 */
function HandleInteractiveCommand(command, filepath) {
  return $if(InteractiveCommandMap.get(command), (fn) => fn(filepath));
}
const HelpInfoMap = new Map([
  ['help', 'Print this message.'],
  ['version', 'Print installed version of do.'],
  ['parse', 'Print the results of parsing <File>.'],
  ['check', 'Validate each <File> and their dependencies.'],
  ['run', 'Run executable file or shell command.'],
]);
function ShowHelp() {
  // do help
  console.log('Usage: do <Command>|<Do_File> [<Do_File>|<Path>|<Shell_Command>]');
  console.log();
  console.log(`Examples
  do run "echo hello world"
  do run "echo \\"hello world\\""
  do build.do
  do build
  `);
  console.log('Command');
  const commandColumnSize = Math.max(...[...HelpInfoMap.keys()].map((command) => command.length));
  for (const [key, value] of HelpInfoMap) {
    console.log(key.padEnd(commandColumnSize), '|', value);
  }
  console.log();
  console.log(`Do_File
  A *.do filepath that resides in the current directory. The ".do" file
  extension is optional.
  `);
  console.log(`Path
  Any filepath that points to an executable file.
  `);
  console.log(`Shell_Command
  A string that represents a shell command. Surround with double quotes "" if
  spaces are necessary, ie: "echo hello world". Use \\" to include double quotes
  within a quoted shell command, ie: "echo \\"hello world\\"".
  `);
}
function ShowVersion() {
  // do version
  console.log('0.0.1');
}
/** @param {string=} filename */
function PrintParse(filename) {
  // do parse <do file>
  if (filename !== undefined) {
    HandleDoFile(filename, function (fileReader) {
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
    });
  } else {
    console.log('Please provide a *.do filepath to parse.');
  }
}
/** @param {string=} filename */
function CommandValidate(filename) {
  // do check <do file>
  console.log('Not implemented!');
  if (filename !== undefined) {
  }
}
/** @param {string=} filepathOrCommand */
function CommandExecute(filepathOrCommand) {
  // do run <executable filepath>
  // do run <shell command>
  console.log('Not implemented!');
  if (filepathOrCommand !== undefined) {
  }
}

/**
 * If the argument following "do" cannot be processed as an interactive
 * command, then it will opened as a *.do filename, instead.
 * @param {string} filename
 * @param {(fileReader: FileReader) => void} callback
 */
function HandleDoFile(filename, callback) {
  if (!filename.endsWith('.do')) {
    filename += '.do';
  }
  // TODO: look for <do file> in current directory only
  if (UseFileReader(filename, callback)) {
    return true;
  }
  console.log(`Could not find "${filename}" in current directory.`);
  return false;
}

/**
 * Chain of Responsibility pattern
 * @typedef {function(string, string=): boolean} Handler
 * @type {Handler[]}
 */
const handlers = [
  HandleInteractiveCommand, //
  (filename) => HandleDoFile(filename, ProcessDoFile),
];

/**
 * The main function, which takes one or two arguments that correspond to
 * either just a command/file name or a command and a file name.
 * @param {string} arg1
 * @param {string} [arg2]
 */
function Do(arg1, arg2) {
  for (const handler of handlers) {
    if (handler(arg1, arg2) === true) {
      break;
    }
  }
}

Do(process.argv[2], process.argv[3]);
