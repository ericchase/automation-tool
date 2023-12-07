import { closeSync, openSync, readSync } from 'fs';
import { Reader } from '../../lib/Reader.mjs';

export class FileReader extends Reader {
  /** @param {string} filepath */
  constructor(filepath) {
    super();
    this.filepath = filepath;
    this.#descriptor = openSync(this.filepath, 'r');
  }

  /**
   * Closes the file if needed.
   * This FileReader instance cannot be used after.
   * @this {FileReader}
   */
  close() {
    if (this.#descriptor) {
      // @external-api
      closeSync(this.#descriptor);
      this.#descriptor = undefined;
    }
  }

  /**
   * Reads next `buffer.length` bytes from file into `buffer`, and returns the
   * number of bytes read.
   * @override
   * @this {FileReader}
   * @param {Uint8Array} buffer
   * @return {number} bytes read
   */
  read(buffer) {
    if (this.#descriptor) {
      // @external-api
      return readSync(this.#descriptor, buffer);
    }
    return 0;
  }

  // these are meant to be for internal use only

  /** @type {number|undefined} */
  #descriptor;
}

/**
 * @param {string} filepath
 * @param {(fileReader: FileReader) => void} callback
 * @return {unknown|undefined} Error if there was an error.
 */
export function UseFileReader(filepath, callback) {
  try {
    const fileReader = new FileReader(filepath);
    callback(fileReader);
    fileReader.close();
  } catch (err) {
    return err;
  }
  return undefined;
}
