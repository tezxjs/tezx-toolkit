import { Router } from 'tezx';
import { sanitized } from 'tezx/utils';

class LocalFS {
  basePath;
  publicUrl;
  sanitize;
  allowPublicAccess;
  maxFileSize;
  allowedTypes;
  autoRenameOnConflict;
  /**
   * Creates a new LocalFS instance.
   * @param options - Storage configuration options
   */
  constructor(options = {}) {
    this.basePath = options.basePath ?? "uploads";
    this.autoRenameOnConflict = options?.autoRenameOnConflict ?? true;
    this.sanitize = options?.sanitize ?? false;
    this.publicUrl = options.publicUrl ?? "/uploads";
    this.allowPublicAccess = options.allowPublicAccess ?? true;
    this.maxFileSize = options.maxFileSize ?? 5 * 1024 * 1024;
    this.allowedTypes = options.allowedTypes ?? ["image/*"];
  }
  /**
   * Save a `File` object to disk.
   *
   * - Validates maximum file size and MIME type.
   * - Resolves filename conflicts if `autoRenameOnConflict` is enabled.
   * - Ensures destination directory exists.
   *
   * @param f - Browser/Fetch `File` object (has `.name`, `.size`, `.type`, `.arrayBuffer()`).
   * @param option - Optional save options:
   *   - `filename` overrides the file's original name.
   *   - `folder` stores the file under `basePath/folder/...`.
   *
   * @returns Promise that resolves to `SavedFileInfo`.
   *
   * @throws Error when file too large or MIME type is not allowed.
   */
  async saveFile(f, option) {
    if (f.size > this.maxFileSize) {
      throw new Error(`File exceeds max size of ${this.maxFileSize} bytes`);
    }
    const folder = option?.folder ?? "";
    let filename = option?.filename ?? f.name;
    if (this.sanitize) {
      filename = sanitized(filename);
    }
    const { finalPath, finalFileName } = await this.#resolveFileName(folder, filename);
    let file = Bun.file(finalPath);
    if (!this.#isTypeAllowed(file.type)) {
      throw new Error(`File type ${f.type} is not allowed`);
    }
    let writer = file.writer();
    const buffer = new Uint8Array(await f.arrayBuffer());
    await writer.write(buffer);
    await writer.end();
    const relativePath = folder ? `${folder}/${finalFileName}` : finalFileName;
    const publicUrl = this.allowPublicAccess ? `${this.publicUrl}/${relativePath}`.replace(/\\|\/\//g, "/") : void 0;
    return {
      savedPath: finalPath,
      filename: finalFileName,
      publicUrl
    };
  }
  /**
   * Delete a file from disk.
   *
   * @param filename - Relative path under `basePath` (e.g. "avatars/me.png").
   * @returns Promise that resolves once the file is removed (no-op if not exists).
   */
  async deleteFile(filename) {
    const file = Bun.file(this.#replace(filename));
    if (await file.exists()) {
      await file.delete();
    }
  }
  /**
   * Read a file from disk and return an ArrayBuffer.
   *
   * @param filename - Relative path under `basePath` (or an absolute path).
   * @returns ArrayBuffer containing file bytes.
   *
   * @example
   * const buf = await fs.readFile("avatars/me.png");
   */
  async readFile(filename) {
    return await Bun.file(this.#replace(filename)).arrayBuffer();
  }
  #replace(filename) {
    return `${this.basePath}/${filename}`.replace(/\\|\/\//g, "/");
  }
  #isTypeAllowed(mimeType) {
    return this.allowedTypes.some((allowed) => allowed === "*" || (allowed.endsWith("/*") ? mimeType.startsWith(allowed.slice(0, -1)) : allowed === mimeType));
  }
  async #resolveFileName(folder, filename) {
    const dirPath = folder ? `${this.basePath}/${folder}` : this.basePath;
    let finalFileName = filename;
    let finalPath = dirPath ? `${dirPath}/${finalFileName}` : finalFileName;
    if (!this.autoRenameOnConflict) return { finalPath, finalFileName };
    const dotIndex = filename.lastIndexOf(".");
    const base = dotIndex >= 0 ? filename.slice(0, dotIndex) : filename;
    const ext = dotIndex >= 0 ? filename.slice(dotIndex) : "";
    let counter = 1;
    while (await Bun.file(finalPath).exists()) {
      finalFileName = `${base}_${counter++}${ext}`;
      finalPath = dirPath ? `${dirPath}/${finalFileName}` : finalFileName;
    }
    return { finalPath, finalFileName };
  }
  /**
  * Create a Router that serves files from this storage under `publicUrl`.
  *
  * Example:
  * ```ts
  * app.route(fs.serveFileResponse());
  * // serves requests like GET /uploads/avatars/me.png
  * ```
  *
  * @param config.onError - Optional error handler `(error, ctx) => Response | Promise<Response>`
  * @returns Router configured to serve files publicly
  *
  * @throws Error if public access is disabled
  */
  serveFileResponse(config) {
    const onError = config?.onError || ((error, ctx) => ctx.json({ success: false, message: error }));
    if (!this.allowPublicAccess) throw new Error("Public access is disabled");
    const router = new Router();
    router.get(`${this.publicUrl}/*filename`, async (ctx) => {
      return ctx.sendFile(this.#replace(ctx?.req?.params?.filename)).catch((error) => {
        return onError(error?.message, ctx);
      });
    });
    return router;
  }
}

export { LocalFS, LocalFS as default };
