import { Context, Router } from 'tezx';

/**
 * Options to configure the LocalFS storage.
 */
interface LocalFSOptions {
    /** The base folder to store files */
    basePath?: string;
    /** The base URL for public access */
    publicUrl?: string;
    /** Allow files to be served publicly */
    allowPublicAccess?: boolean;
    /** Rename duplicate files automatically */
    autoRenameOnConflict?: boolean;
    /** Maximum file size in bytes */
    maxFileSize?: number;
    /** Allowed MIME types for uploads */
    allowedTypes?: string[];
}

/**
 * Local file storage system with runtime (Node/Deno) compatibility.
 */
declare class LocalFS {
    #private;
    private basePath;
    private publicUrl;
    private allowPublicAccess;
    private autoRenameOnConflict;
    private maxFileSize;
    private allowedTypes;
    private runtime;
    /**
     * Creates a new LocalFS instance.
     * @param options - Storage configuration options
     */
    constructor(options?: LocalFSOptions);
    /**
     * Saves a file to disk after validating its MIME type and size.
     * @param fileName - The desired file name
     * @param buffer - The file buffer
     * @param mimeType - Optional MIME type override
     * @returns File save info: path, name, and public URL
     */
    saveFile(fileName: string, buffer: Buffer, mimeType?: string): Promise<{
        savedPath: string;
        fileName: string;
        publicUrl: string | undefined;
    }>;
    /**
     * Deletes a file from disk.
     * @param fileName - Relative file path
     */
    deleteFile(fileName: string): Promise<void>;
    /**
     * Reads a file and returns its buffer.
     * @param fileName - File name
     * @returns File contents as a Buffer
     */
    readFile(fileName: string): Promise<Buffer<ArrayBufferLike> | Uint8Array<ArrayBuffer>>;
    /**
     * Lists all files in a directory.
     * @param folder - Optional sub-folder
     * @param recursive - List files recursively. `default: false`
     * @returns Array of file paths relative to the base path
     */
    listFiles(folder?: string, recursive?: boolean): Promise<string[]>;
    /**
     * Adds a route to serve files publicly from the storage.
     * @param config - Optional error handler
     * @returns {Router} A TezX Router
     */
    serveFileResponse(config?: {
        onError?: (error: string, ctx: Context) => Promise<Response> | Response;
    }): Router<{}>;
    /**
     * Generates the public URL for a file.
     * @param fileName - File name (relative to basePath)
     * @returns The public URL
     */
    getPublicUrl(fileName: string): string;
}

export { LocalFS, type LocalFSOptions };
