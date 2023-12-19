export class DirectoryManager {
  constructor() {}
  /**
   * @this {DirectoryManager}
   * @return {string}
   */
  get() {
    return '';
  }
  /**
   * If `path` is accessible change the current working directory to `path` and
   * return true; otherwise, return false.
   * @this {DirectoryManager}
   * @param {string} path
   * @return {boolean}
   */
  push(path) {
    return false;
  }
  /**
   * If `path` resides within the current working directory, change the current
   * working directory to `path` and return true; otherwise, return false.
   * @this {DirectoryManager}
   * @param {string} path
   * @return {boolean}
   */
  pushSubdirectory(path) {
    return this.push(path);
  }
  /**
   * @this {DirectoryManager}
   * @return {boolean}
   */
  pop() {
    return false;
  }
}
