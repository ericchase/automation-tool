import { closeSync, openSync, readSync } from 'node:fs';
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
   * Reads next `buffer.length` or `end-start` bytes from file into `buffer`,
   * and returns the number of bytes read. The first bytes will be copied to
   * offset `start` and continue from there.
   * @override
   * @this {FileReader}
   * @param {Uint8Array} buffer
   * @param {number=} start
   * @param {number=} end
   * @returns {number} bytes copied
   */
  read(buffer, start, end) {
    start ??= 0;
    end ??= buffer.length;
    if (this.#descriptor) {
      // @external-api
      return readSync(this.#descriptor, buffer, start, end - start, null);
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
 * @param {(fileReader: FileReader) => *|Promise<*>} callback
 * @param {(error:unknown)=>*|Promise<*>=} onerror
 */
export async function UseFileReader(filepath, callback, onerror) {
  try {
    const fileReader = new FileReader(filepath);
    try {
      await callback(fileReader);
      return true;
    } catch (err) {
      if (onerror) {
        await onerror(err);
      }
    } finally {
      fileReader.close();
    }
  } catch (err) {
    if (onerror) {
      await onerror(err);
    }
  }
  return false;
}
