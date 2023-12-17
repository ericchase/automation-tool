import { $if } from './lib.mjs';

/**
 * @typedef Command
 * @property {string} command_name
 * @property {()=>void} command_function
 */

const CommandMap = new Map([
  ['build', CommandBuild], //
  ['copy', CommandCopy],
  ['doto', CommandDoto],
  ['run', CommandExecute],
  ['when', CommandWhen],
]);

/**
 * Non-interactive commands are those parsed from *.doto files. They cannot be
 * triggered directly in the terminal by a user.
 * @param {string} commandName
 * @param {string} commandObject
 */
function ProcessCommand(commandName, commandObject) {
  return $if(CommandMap.get(commandName), (fn) => fn(commandObject));
}
/** @param {string} commandObject */
function CommandBuild(commandObject) {
  // build <Sub_Folder>
  // run build.doto file in target subfolder
}
/** @param {string} commandObject */
function CommandCopy(commandObject) {
  // copy from <Folder> to <Folder>
  // copy from <Path> to <Folder>
  // copy from <Glob> to <Folder>
  // overwrite files
}
/** @param {string} commandObject */
function CommandDoto(commandObject) {
  // doto <Doto_File>
  // processes target file as if ran with doto directly
}
/** @param {string} commandObject */
function CommandExecute(commandObject) {
  // run <Path>
  // run <Shell_Command>
}
/** @param {string} commandObject */
function CommandWhen(commandObject) {
  // when <Folder> is modified, doto <Command>|<Doto_File>
  // when <Path> is modified, doto <Command>|<Doto_File>
  // when <Glob> is modified, doto <Command>|<Doto_File>
  // the command may be any interactive/some non-interactive command
}
