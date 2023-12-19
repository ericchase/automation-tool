/**
 * @template T
 * @typedef {(request:T)=>Promise<boolean>} HandleRequest
 */

/** @template T */
export class Handler {
  /**
   * @this {Handler<T>}
   * @type {HandleRequest<T>}
   */
  async handleRequest(request) {
    return false;
  }
}

/** @template T */
export class HandlerChain {
  handlers;
  /** @param {Handler<T>[]} handlers */
  constructor(handlers) {
    this.handlers = handlers;
  }
  /**
   * @this {HandlerChain<T>}
   * @type {HandleRequest<T>}
   */
  async handle(request) {
    for (const handler of this.handlers) {
      if ((await handler.handleRequest(request)) === true) {
        return true;
      }
    }
    return false;
  }
}
