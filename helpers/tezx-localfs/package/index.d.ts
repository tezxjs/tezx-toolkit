import { Context, Router } from 'tezx';

/**
 * Options to configure the LocalFS storage.
 */
interface LocalFSOptions {
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
interface SavedFileInfo {
    /** Absolute path on disk where the file was saved */
    savedPath: string;
    /** Final filename used (may be renamed if conflict) */
    filename: string;
    /** Public URL to access the file (if allowPublicAccess is true) */
    publicUrl?: string;
}

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
declare class LocalFS {
    #private;
    private basePath;
    private publicUrl;
    private sanitize;
    private allowPublicAccess;
    private maxFileSize;
    private allowedTypes;
    private autoRenameOnConflict;
    /**
     * Creates a new LocalFS instance.
     * @param options - Storage configuration options
     */
    constructor(options?: LocalFSOptions);
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
    saveFile(f: File, option?: {
        filename?: string;
        folder?: string;
    }): Promise<SavedFileInfo>;
    /**
     * Delete a file from disk.
     *
     * @param filename - Relative path under `basePath` (e.g. "avatars/me.png").
     * @returns Promise that resolves once the file is removed (no-op if not exists).
     */
    deleteFile(filename: string): Promise<void>;
    /**
     * Read a file from disk and return an ArrayBuffer.
     *
     * @param filename - Relative path under `basePath` (or an absolute path).
     * @returns ArrayBuffer containing file bytes.
     *
     * @example
     * const buf = await fs.readFile("avatars/me.png");
     */
    readFile(filename: string): Promise<ArrayBuffer>;
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
    serveFileResponse(config?: {
        onError?: (error: string, ctx: Context) => Promise<Response> | Response;
    }): Router<{}>;
}

export { LocalFS, LocalFS as default };
export type { LocalFSOptions, SavedFileInfo };
