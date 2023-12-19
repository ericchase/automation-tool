// External
export { getArgs } from './external/deno/Argv.mjs';
export { runFile } from './external/deno/ChildProcess.mjs';
export { CurrentDirectory } from './external/deno/FileSystem.mjs';
export { FileReader, UseFileReader } from './external/node/FileReader.mjs';
import { getArgs } from './external/deno/Argv.mjs';

// Internal
import { HandlerChain } from './ChainOfResponsibility.mjs';
import { DotoFileHandler, HelpHandler, InteractiveCommandHandler, NonInteractiveCommandHandler } from './Doto.mjs';

export const interactiveCommandHandler = new InteractiveCommandHandler();
export const nonInteractiveCommandHandler = new NonInteractiveCommandHandler();
export const dotoFileHandler = new DotoFileHandler();
export const helpHandler = new HelpHandler();

new HandlerChain([
  interactiveCommandHandler, //
  dotoFileHandler,
  helpHandler,
]).handle(getArgs());
