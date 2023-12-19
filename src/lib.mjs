/**
 * If `value` is not undefined and not null, call `fnThen` with `value` as
 * argument, and then return `true`. Otherwise, if `fnElse` exists, call it
 * with no argument, and then return `false`.
 *
 * Useful for narrowing value types and using within a function.
 *
 * @template TValue
 * @param {(TValue | null | undefined)} value
 * @param {(value: TValue) => void} fnThen
 * @param {() => void} [fnElse]
 */
export function $if(value, fnThen, fnElse) {
  if (value !== null && value !== undefined) {
    fnThen(value);
    return true;
  }
  fnElse?.();
  return false;
}
/**
 * @template TValue
 * @param {(TValue | null | undefined)} value
 * @param {(value: TValue) => Promise<*>} asyncThen
 * @param {() => Promise<*>} [asyncElse]
 */
export async function $asyncif(value, asyncThen, asyncElse) {
  if (value !== null && value !== undefined) {
    await asyncThen(value);
    return true;
  }
  await asyncElse?.();
  return false;
}

/**
 * @template T
 * @typedef LoopConfig
 * @property {()=>T} step
 * @property {(value:T,index:number)=>boolean} condition
 * @property {(value:T,index:number)=>*} body
 */
/**
 * @template T
 * @param {(()=>T)|LoopConfig<T>} step
 * @param {(value:T,index:number)=>boolean=} condition
 * @param {(value:T,index:number)=>*=} body
 */
export function $loop(step, condition, body) {
  if (typeof step === 'function') {
    if (typeof condition === 'function' && typeof body === 'function') {
      loop({ step, condition, body });
    }
  } else {
    loop(step);
  }
}
/**
 * @template T
 * @param {LoopConfig<T>} params
 */
function loop({ step, condition, body }) {
  for (let value = step(), index = 0; condition(value, index) === true; value = step(), index++) {
    body(value, index);
  }
}

/**
 * @template T
 * @typedef AsyncLoopConfig
 * @property {()=>Promise<T>} step
 * @property {(value:T,index:number)=>Promise<boolean>} condition
 * @property {(value:T,index:number)=>Promise<*>} body
 */
/**
 * @template T
 * @param {(()=>Promise<T>)|AsyncLoopConfig<T>} step
 * @param {(value:T,index:number)=>Promise<boolean>=} condition
 * @param {(value:T,index:number)=>*=} body
 */
export async function $asyncloop(step, condition, body) {
  if (typeof step === 'function') {
    if (typeof condition === 'function' && typeof body === 'function') {
      await asyncloop({ step, condition, body });
    }
  } else {
    await asyncloop(step);
  }
}
/**
 * @template T
 * @param {AsyncLoopConfig<T>} params
 */
async function asyncloop({ step, condition, body }) {
  for (let value = await step(), index = 0; (await condition(value, index)) === true; value = await step(), index++) {
    await body(value, index);
  }
}

let lastStdOutNewlineOnce = false;
/**
 * @param {*} args
 */
export function stdOut(...args) {
  lastStdOutNewlineOnce = false;
  console.log(...args);
}
/**
 * @param {*} args
 */
export function stdOutNewlineOnce(...args) {
  if (lastStdOutNewlineOnce === false) {
    lastStdOutNewlineOnce = true;
    console.log(...args);
  }
}
/**
 * @param {*} args
 */
export function stdErr(...args) {
  console.error('%cError:', 'color:red', ...args);
}
