import * as fs from 'node:fs/promises';
import { Byte } from '../../lib/Byte.mts';

export class AsyncFileReader extends Byte.AsyncReader {
  constructor(path: string) {
    super(Byte.EmptyBytes);
    this._path = path;
  }

  async open(this: AsyncFileReader): Promise<void> {
    if (this._handle === undefined) {
      this._handle = await fs.open(this.path, 'r');
    }
  }

  /**
   * Closes the file if needed. This FileReader instance cannot be used after.
   */
  async close(this: AsyncFileReader): Promise<void> {
    if (this._handle !== undefined) {
      await this._handle.close();
      this._handle = undefined;
    }
  }

  /**
   * Reads next `buffer.length` or `end-start` bytes from file into `buffer`,
   * and returns the number of bytes read. The first bytes will be copied to
   * offset `start` and continue from there.
   */
  async read(this: AsyncFileReader, bytes: Uint8Array, start = 0, end = bytes.length): Promise<number> {
    if (this._handle !== undefined) {
      return (await this._handle.read(bytes, start, end - start, null)).bytesRead;
    }
    return 0;
  }

  get path() {
    return this._path;
  }

  private _path: string;
  private _handle?: fs.FileHandle;
}

/**
 * Try to open `path` as a new FileReader. On success, pass the reader to the
 * `callback` function and return true. If an error occurs, pass the error the
 * `onerror` function if one exists and return false.
 */
export async function UseAsyncFileReader(
  path: string,
  callback: (reader: AsyncFileReader) => Promise<any>,
  onerror?: (error: unknown) => Promise<any>,
): Promise<boolean> {
  let error = undefined;

  try {
    const reader = new AsyncFileReader(path);
    await reader.open();
    try {
      await callback(reader);
    } catch (err) {
      error ??= err;
    }
    await reader.close();
  } catch (err) {
    error ??= err;
  }

  if (error) {
    if (onerror) {
      await onerror(error);
    } else {
      throw error;
    }
    return false;
  }

  return true;
}
