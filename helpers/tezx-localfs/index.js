import path from "node:path";
import { Environment } from "tezx/helper";
import { Router } from "tezx";
import { mimeMap } from "./mimeMap.js";
function getMimeTypeFromExtension(ext) {
    ext = ext.replace(/^\./, "").toLowerCase();
    return mimeMap[ext] || null;
}
export class LocalFS {
    basePath;
    publicUrl;
    allowPublicAccess;
    autoRenameOnConflict;
    maxFileSize;
    allowedTypes;
    runtime = Environment.getEnvironment;
    constructor(options = {}) {
        this.basePath = options.basePath || "uploads";
        this.publicUrl = options.publicUrl || "/uploads";
        this.allowPublicAccess = options.allowPublicAccess ?? true;
        this.autoRenameOnConflict = options.autoRenameOnConflict ?? true;
        this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024;
        this.allowedTypes = options.allowedTypes || ["image/*"];
    }
    async saveFile(fileName, buffer, mimeType) {
        if (buffer.length > this.maxFileSize) {
            throw new Error(`File exceeds max size of ${this.maxFileSize} bytes`);
        }
        const type = mimeType || this.#getMimeType(fileName) || "application/octet-stream";
        if (!this.#isTypeAllowed(type)) {
            throw new Error(`File type ${type} is not allowed`);
        }
        const { finalPath, fileName: finalFileName } = await this.#resolveFileName(path.join(this.basePath, fileName));
        await this.#ensureDir(path.dirname(finalPath));
        if (this.runtime === 'deno') {
            await Deno.writeFile(finalPath, buffer);
        }
        else {
            const { writeFile } = await import('node:fs/promises');
            await writeFile(finalPath, buffer);
        }
        const body = {
            savedPath: finalPath,
            fileName: finalFileName,
            publicUrl: this.allowPublicAccess ? this.getPublicUrl(path.relative(this.basePath, finalPath)) : undefined,
        };
        return body;
    }
    async deleteFile(fileName) {
        const fullPath = path.join(this.basePath, fileName);
        if (await this.#exists(fullPath)) {
            if (this.runtime === 'deno') {
                await Deno.remove(fullPath, { recursive: true });
            }
            else {
                const { unlink } = await import('node:fs/promises');
                await unlink(fullPath);
            }
        }
    }
    async readFile(fileName) {
        const fullPath = path.join(this.basePath, fileName);
        if (this.runtime === 'deno') {
            return await Deno.readFile(fullPath);
        }
        else {
            const { readFile } = await import('node:fs/promises');
            return await readFile(fullPath);
        }
    }
    async listFiles(folder = "", recursive = false) {
        const fullPath = path.join(this.basePath, folder);
        await this.#ensureDir(fullPath);
        if (this.runtime === 'deno') {
            return await this.#listFilesDeno(fullPath, recursive);
        }
        else {
            const { readdir } = await import('node:fs/promises');
            if (!recursive) {
                return await readdir(fullPath);
            }
            const result = [];
            async function walk(dir) {
                const { readdir } = await import('node:fs/promises');
                const entries = await readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const entryPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await walk(entryPath);
                    }
                    else {
                        result.push(path.relative(fullPath, entryPath));
                    }
                }
            }
            await walk(fullPath);
            return result;
        }
    }
    serveFileResponse(config) {
        const onError = config?.onError || ((error, ctx) => ctx.json({ success: false, message: error }));
        if (!this.allowPublicAccess)
            throw new Error("Public access is disabled");
        const router = new Router();
        router.get(path.join(this.publicUrl, "/*filename"), async (ctx) => {
            return ctx.sendFile(path.join(this.basePath, ctx?.req?.params?.filename)).catch((error) => {
                return onError(error?.message, ctx);
            });
        });
        return router;
    }
    getPublicUrl(fileName) {
        if (!this.allowPublicAccess)
            throw new Error("Public access is disabled");
        return path.join(this.publicUrl, fileName).replace(/\\/g, "/");
    }
    async #ensureDir(dir) {
        if (this.runtime === 'deno') {
            await Deno.mkdir(dir, { recursive: true });
        }
        else {
            const { mkdir } = await import('node:fs/promises');
            await mkdir(dir, { recursive: true });
        }
    }
    #getMimeType(fileName) {
        const ext = path.extname(fileName).replace(".", "").toLowerCase();
        return getMimeTypeFromExtension(ext) || "application/octet-stream";
    }
    async #resolveFileName(filePath) {
        let counter = 1;
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext);
        const dir = path.dirname(filePath);
        let finalFileName = `${base}${ext}`;
        let finalPath = path.join(dir, finalFileName);
        if (!this.autoRenameOnConflict)
            return { fileName: finalFileName, finalPath };
        while (await this.#exists(finalPath)) {
            finalFileName = `${base}_${counter++}${ext}`;
            finalPath = path.join(dir, finalFileName);
        }
        return { fileName: finalFileName, finalPath };
    }
    async #exists(filePath) {
        try {
            if (this.runtime === 'deno') {
                Deno.statSync(filePath);
                return true;
            }
            else {
                const { access } = await import('node:fs/promises');
                await access(filePath);
                return true;
            }
        }
        catch {
            return false;
        }
    }
    #isTypeAllowed(mimeType) {
        return this.allowedTypes.some(allowed => allowed === "*" ||
            (allowed.endsWith("/*") ? mimeType.startsWith(allowed.slice(0, -1)) : allowed === mimeType));
    }
    async #listFilesDeno(dir, recursive = false, basePath = dir, result = []) {
        for await (const entry of Deno.readDir(dir)) {
            const entryPath = path.join(dir, entry.name);
            if (entry.isDirectory && recursive) {
                await this.#listFilesDeno(entryPath, recursive, basePath, result);
            }
            else {
                result.push(path.relative(basePath, entryPath));
            }
        }
        return result;
    }
}
