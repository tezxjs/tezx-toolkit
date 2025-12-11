/**
 * Options to configure the LocalFS storage.
 */
export interface LocalFSOptions {
    /** Base folder to store files on disk (default: "uploads") */
    basePath?: string;
    /** Base URL to expose files publicly (default: "/uploads") */
    publicUrl?: string;
    /** Allow files to be served publicly (default: true) */
    allowPublicAccess?: boolean;
    /** Automatically rename duplicate files (default: true) */
    autoRenameOnConflict?: boolean;
    /** Maximum allowed file size in bytes (default: 5MB) */
    maxFileSize?: number;
    /** Allowed MIME types or patterns (default: ["image/*"]) */
    allowedTypes?: string[];
    /** Sanitize filenames before saving (default: false) */
    sanitize?: boolean;
}

/**
 * Information returned after a file is saved.
 */
export interface SavedFileInfo {
    /** Absolute path on disk where the file was saved */
    savedPath: string;
    /** Final filename used (may be renamed if conflict) */
    filename: string;
    /** Public URL to access the file (if allowPublicAccess is true) */
    publicUrl?: string;
}

import { Context, Router } from "tezx";
import { sanitized, sanitizePathSplit } from "tezx/utils";


/**
 * Local file storage system for Bun/Node environments.
 *
 * - Saves uploaded `File` objects to disk under `basePath`.
 * - Optionally auto-renames duplicates (append `_1`, `_2`, ...).
 * - Optionally sanitizes filenames.
 * - Generates public URLs that map to `publicUrl` (not including `basePath`).
 *
 * Example:
 * ```ts
 * const fs = new LocalFS({ basePath: "uploads", publicUrl: "/static", sanitize: true });
 * const info = await fs.saveFile(file, { folder: "avatars", filename: "me.png" });
 * console.log(info.publicUrl); // -> /static/avatars/me.png
 * ```
 */
class LocalFS {
    private basePath: string;
    private publicUrl: string;
    private sanitize: boolean
    private allowPublicAccess: boolean;
    private maxFileSize: number;
    private allowedTypes: string[];
    private autoRenameOnConflict: boolean;

    /**
     * Creates a new LocalFS instance.
     * @param options - Storage configuration options
     */
    constructor(options: LocalFSOptions = {}) {
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
    async saveFile(f: File, option?: {
        filename?: string,
        folder?: string
    }): Promise<SavedFileInfo> {

        if (f.size > this.maxFileSize) {
            throw new Error(`File exceeds max size of ${this.maxFileSize} bytes`);
        }

        const folder = option?.folder ?? "";
        let filename = option?.filename ?? f.name;

        // Optional sanitization
        if (this.sanitize) {
            filename = sanitized(filename);
        }

        // Build final path
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
        const publicUrl = this.allowPublicAccess ? `${this.publicUrl}/${relativePath}`.replace(/\\|\/\//g, "/") : undefined;

        return {
            savedPath: finalPath,
            filename: finalFileName,
            publicUrl: publicUrl
        };
    }

    /**
     * Delete a file from disk.
     *
     * @param filename - Relative path under `basePath` (e.g. "avatars/me.png").
     * @returns Promise that resolves once the file is removed (no-op if not exists).
     */
    async deleteFile(filename: string) {
        const file = Bun.file(this.#replace(filename));
        if (await file.exists()) {
            await file.delete()
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
    async readFile(filename: string): Promise<ArrayBuffer> {
        return await Bun.file(this.#replace(filename)).arrayBuffer();
    }
    #replace(filename: string) {
        return `${this.basePath}/${filename}`.replace(/\\|\/\//g, "/")
    }
    #isTypeAllowed(mimeType: string): boolean {
        return this.allowedTypes.some(allowed => allowed === "*" || (allowed.endsWith("/*") ? mimeType.startsWith(allowed.slice(0, -1)) : allowed === mimeType));
    }

    async #resolveFileName(folder: string, filename: string): Promise<{ finalPath: string; finalFileName: string }> {
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
    serveFileResponse(config?: { onError?: (error: string, ctx: Context) => Promise<Response> | Response }) {
        const onError = config?.onError || ((error, ctx) => ctx.json({ success: false, message: error }));
        if (!this.allowPublicAccess) throw new Error("Public access is disabled");

        const router = new Router();
        router.get(`${this.publicUrl}/*filename`, async (ctx) => {
            return ctx.sendFile(this.#replace(ctx?.req?.params?.filename)).catch((error: any) => {
                return onError(error?.message, ctx);
            });
        });
        return router;
    }
}

export { LocalFS as default, LocalFS };
