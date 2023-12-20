import { walk } from 'https://deno.land/std@0.209.0/fs/walk.ts';

/**
 * @typedef WalkEntry
 * @property {boolean} isDirectory
 * @property {boolean} isFile
 * @property {boolean} isSymlink
 * @property {string} name
 * @property {string} path
 */

import { stdErr } from '../../lib.mjs';
import { DirectoryManager } from '../../lib/DirectoryManager.mjs';

/** @type {(path:string)=>WalkEntry[]} walk */
const Walk = walk;

/**
 * @throws Deno.errors.NotFound if directory not available.
 * @return {string}
 */
function GetCurrentWorkingDirectory() {
  return Deno.cwd();
}

/**
 * @throws Deno.errors.NotFound if directory not found.
 * @throws Deno.errors.PermissionDenied if the user does not have operating system file access rights.
 * @param {string} path
 */
function ChangeCurrentWorkingDirectory(path) {
  Deno.chdir(path);
}

class CurrentDirectoryManager extends DirectoryManager {
  constructor() {
    super();
    this.#list = [GetCurrentWorkingDirectory()];
  }

  /**
   * @this {CurrentDirectoryManager}
   * @return {string}
   */
  get() {
    return this.#list[this.#list.length - 1];
  }

  /**
   * @this {CurrentDirectoryManager}
   * @param {string} path
   * @return {boolean}
   */
  push(path) {
    let sanitized = path.replaceAll('/', '\\');
    try {
      ChangeCurrentWorkingDirectory(sanitized);
      this.#list.push(GetCurrentWorkingDirectory());
      return true;
    } catch (err) {
      stdErr(`Could not open directory "${path}".`);
    }
    return false;
  }

  /**
   * @this {CurrentDirectoryManager}
   * @param {string} path
   * @return {boolean}
   */
  pushSubdirectory(path) {
    let sanitized = path.replaceAll('/', '\\');
    if (!sanitized.startsWith('.\\') && !sanitized.startsWith('..\\')) {
      sanitized = '.\\' + sanitized;
    }
    try {
      ChangeCurrentWorkingDirectory(sanitized);
      const newDir = GetCurrentWorkingDirectory();
      ChangeCurrentWorkingDirectory(this.get());
      if (newDir.startsWith(this.get())) {
        return this.push(newDir);
      } else {
        stdErr(`"${path}" is not a subdirectory of "${this.get()}".`);
      }
    } catch (err) {
      stdErr(`Could not open directory "${path}".`);
    }
    return false;
  }

  /**
   * @this {CurrentDirectoryManager}
   * @return {boolean}
   */
  pop() {
    if (this.#list.length > 1) {
      this.#list.pop();
    }
    try {
      ChangeCurrentWorkingDirectory(this.get());
      return true;
    } catch (err) {
      stdErr('Could not change directory to', this.get());
      return false;
    }
  }

  #list;
}

/**
 * @param {string} path
 * @return {string|undefined}
 */
export function GetDirectoryPath(path) {
  try {
    const cwd = Deno.cwd();
    Deno.chdir(path);
    const target = Deno.cwd();
    Deno.chdir(cwd);
    return target;
  } catch (err) {
    console.log(err);
  }
  return undefined;
}

/**
 * @param {string} glob
 * @param {string} from
 * @param {string} to
 */
export async function CopyFolder(glob, from, to) {
  await Deno.mkdir(to, { recursive: true });
  const fromBase = GetDirectoryPath(from);
  const toBase = GetDirectoryPath(to);

  if (fromBase && toBase) {
    if (glob.length === 0) glob = '*';
    const filterList = glob.replaceAll('.', '\\.').replaceAll('*', '.*').split('|');

    /** @type {Map<string,string>} [entry dir path, absolute entry dir path] */
    const absoluteFromDirPathMap = new Map();
    /** @type {Set<string>} */
    const toDirPathSet = new Set();
    /** @type {Map<string,string>} */
    const copyMap = new Map();
    for await (const entry of Walk(from)) {
      if (entry.isFile) {
        if (glob === '*' || filterList.some((regex) => entry.name.match(regex))) {
          const absoluteFromDirPath = getAbsoluteDirPath(entry, absoluteFromDirPathMap);
          if (absoluteFromDirPath) {
            const relativeToBase = absoluteFromDirPath?.slice(fromBase.length);
            const toDirPath = toBase + relativeToBase;
            if (relativeToBase.length > 0) {
              toDirPathSet.add(toDirPath);
            }
            copyMap.set(entry.path, toDirPath + '\\' + entry.name);
          }
        }
      }
    }
    try {
      await Promise.allSettled([...toDirPathSet].map((path) => Deno.mkdir(path, { recursive: true })));
    } catch (err) {
      console.log('mkdir error:', err);
    }
    try {
      await Promise.allSettled([...copyMap].map(([from, to]) => Deno.copyFile(from, to)));
    } catch (err) {
      console.log('copyfile error:', err);
    }
  }
}

/**
 * @param {WalkEntry} entry
 * @param {Map<string, string>} map
 */
function getAbsoluteDirPath(entry, map) {
  const { name, path } = entry;
  const dirPath = path.slice(0, path.length - name.length);
  const absoluteDirPath = map.get(dirPath);
  if (absoluteDirPath) {
    return absoluteDirPath;
  } else {
    const absoluteDirPath = GetDirectoryPath(dirPath);
    if (absoluteDirPath) {
      map.set(dirPath, absoluteDirPath);
      return absoluteDirPath;
    }
  }
}

export const CurrentDirectory = new CurrentDirectoryManager();
