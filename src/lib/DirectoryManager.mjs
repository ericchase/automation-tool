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
   * @this {DirectoryManager}
   * @param {string} value
   * @return {boolean}
   */
  push(value) {
    return false;
  }
  /**
   * @this {DirectoryManager}
   * @param {string} value
   * @return {boolean}
   */
  pushSubdirectory(value) {
    return this.push(value);
  }
  /**
   * @this {DirectoryManager}
   * @return {boolean}
   */
  pop() {
    return false;
  }
}
