import { $if } from './lib.mjs';

/**
 * @typedef {string} InteractiveCommand
 */

const InteractiveCommandMap = new Map([
  ['help', ShowHelp], // print help information
  ['version', ShowVersion], // print installed version of doto
  ['parse', ParseFile], // parse a doto file and print each line of tokens
  ['check', ValidateFile], // validate each doto file and their dependencies in current folder
  ['run', CommandExecute], // run executable file or shell command
]);

/**
 * Interactive commands are those entered into the terminal directly by a user.
 * The token immediately following "doto" will be processed as an interactive
 * command. If the token is not reserved as an interactive command below, then
 * it will processed as a *.doto filename, instead.
 * @param {string} command
 * @param {string=} filepathOrCommand
 */
function HandleInteractiveCommand(command, filepathOrCommand) {
  return $if(InteractiveCommandMap.get(command), (fn) => fn(filepathOrCommand));
}

const HelpInfoMap = new Map([
  ['help', 'Print this message.'], //
  ['version', 'Print the version of this doto executable.'],
  ['parse', 'Print the results of parsing a <Doto_File>.'],
  ['check', 'Validate each <Doto_File> and their dependencies.'],
]);

const HelpCommandInfoMap = new Map([
  ['run', 'Run a <Path> or <Shell_Command>.'], //
]);

function ShowHelp() {
  // doto help
  console.log('Usage: doto <Command>|<Doto_File> [<Doto_File>|<Path>|<Shell_Command>]');
  console.log();
  console.log(`Examples
  doto check build.doto
  doto build.doto
  doto build
  `);
  console.log('Command');
  const commandColumnSize = Math.max(...[...HelpInfoMap.keys()].map((command) => command.length));
  for (const [key, value] of HelpInfoMap) {
    console.log(key.padEnd(commandColumnSize), '|', value);
  }
  console.log();
  console.log(`Doto_File
  A *.doto filepath that resides in the current directory. The ".doto" file
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
  // doto version
  console.log('0.0.1');
}
/** @param {string=} filepath */
function ParseFile(filepath) {
  // doto parse <Doto_File>
  if (filepath !== undefined) {
    HandleDoFile(filepath, function (fileReader) {
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
    console.log('Please provide a *.doto filepath to parse.');
  }
}
/** @param {string=} filepath */
function ValidateFile(filepath) {
  // doto check <Doto_File>
  console.log('Not implemented!');
  if (filepath !== undefined) {
  }
}
