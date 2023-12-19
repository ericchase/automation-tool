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

export const CurrentDirectory = new CurrentDirectoryManager();

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
