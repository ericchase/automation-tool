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
 * Try to open filepath as a FileReader. Return true on success. Return the
 * error that was thrown on failure.
 * @param {string} filepath
 * @param {(fileReader: FileReader) => void} callback
 * @return {true|unknown} The error if there was an error, true
 */
export function UseFileReader(filepath, callback) {
  try {
    const fileReader = new FileReader(filepath);
    try {
      callback(fileReader);
    } catch (err) {
      console.log(err);
    }
    fileReader.close();
  } catch (err) {
    return err;
  }
  return true;
}
