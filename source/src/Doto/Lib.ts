let lastStdOutNewlineOnce = false;

export function stdOut(...args: any) {
  lastStdOutNewlineOnce = false;
  console.log(...args);
}

export function stdOutNewlineOnce(...args: any) {
  if (lastStdOutNewlineOnce === false) {
    lastStdOutNewlineOnce = true;
    console.log(...args);
  }
}

export function stdErr(...args: any) {
  console.error('%cError:', 'color:red', ...args);
}
