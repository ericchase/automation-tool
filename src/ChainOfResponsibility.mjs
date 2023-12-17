/** @template T */
export class Handler {
  /**
   * @param {T} request
   * @returns {boolean}
   */
  handleRequest(request) {
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
   * @param {T} request
   * @returns {boolean}
   */
  handle(request) {
    for (const handler of this.handlers) {
      if (handler.handleRequest(request) === true) {
        return true;
      }
    }
    return false;
  }
}
