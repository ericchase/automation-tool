// External
import { getArg } from './external/deno/Argv.mjs';

// Internal
import { HandlerChain } from './ChainOfResponsibility.mjs';
import { DotoFileHandler, CommandHandler } from './Doto.mjs';

new HandlerChain([
  new CommandHandler(), //
  new DotoFileHandler(),
  // ErrorHandler
]).handle([getArg(0) ?? 'help', getArg(1)]);
