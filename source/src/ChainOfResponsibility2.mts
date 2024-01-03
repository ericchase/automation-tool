export class Handler<T> {
  async handleRequest(this: Handler<T>, request: T): Promise<boolean> {
    return false;
  }
}

/** @template T */
export class HandlerChain<T> {
  constructor(public handlers: Handler<T>[]) {}
  async handle(this: HandlerChain<T>, request: T) {
    for (const handler of this.handlers) {
      if ((await handler.handleRequest(request)) === true) {
        return true;
      }
    }
    return false;
  }
}
