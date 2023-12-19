import { stdErr } from '../../lib.mjs';
import { DirectoryManager } from '../../lib/DirectoryManager.mjs';

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
   * @param {string} value
   * @return {boolean}
   */
  push(value) {
    try {
      ChangeCurrentWorkingDirectory(value.replaceAll('/', '\\'));
      this.#list.push(GetCurrentWorkingDirectory());
      return true;
    } catch (err) {
      stdErr('Could not push directory', value);
      return false;
    }
  }

  /**
   * @this {CurrentDirectoryManager}
   * @param {string} value
   * @return {boolean}
   */
  pushSubdirectory(value) {
    if (value.startsWith('./') || value.startsWith('.\\')) {
      return this.push(value);
    } else {
      return this.push('.\\' + value);
    }
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

export const CurrentDirectory = new CurrentDirectoryManager();

/**
 * @throws Deno.errors.NotFound if directory not available.
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
