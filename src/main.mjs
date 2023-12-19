import { HandlerChain } from './ChainOfResponsibility.mjs';
import { dotoFileHandler, helpHandler, interactiveCommandHandler } from './Doto.mjs';
import { GetArgs } from './external.mjs';

new HandlerChain([
  interactiveCommandHandler, //
  dotoFileHandler,
  helpHandler,
]).handle(GetArgs());
