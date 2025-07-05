"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFS = void 0;
const node_path_1 = __importDefault(require("node:path"));
const helper_1 = require("tezx/helper");
const tezx_1 = require("tezx");
const mimeMap_js_1 = require("./mimeMap.js");
function getMimeTypeFromExtension(ext) {
    ext = ext.replace(/^\./, "").toLowerCase();
    return mimeMap_js_1.mimeMap[ext] || null;
}
class LocalFS {
    basePath;
    publicUrl;
    allowPublicAccess;
    autoRenameOnConflict;
    maxFileSize;
    allowedTypes;
    runtime = helper_1.Environment.getEnvironment;
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
        const { finalPath, fileName: finalFileName } = await this.#resolveFileName(node_path_1.default.join(this.basePath, fileName));
        await this.#ensureDir(node_path_1.default.dirname(finalPath));
        if (this.runtime === 'deno') {
            await Deno.writeFile(finalPath, buffer);
        }
        else {
            const { writeFile } = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
            await writeFile(finalPath, buffer);
        }
        const body = {
            savedPath: finalPath,
            fileName: finalFileName,
            publicUrl: this.allowPublicAccess ? this.getPublicUrl(node_path_1.default.relative(this.basePath, finalPath)) : undefined,
        };
        return body;
    }
    async deleteFile(fileName) {
        const fullPath = node_path_1.default.join(this.basePath, fileName);
        if (await this.#exists(fullPath)) {
            if (this.runtime === 'deno') {
                await Deno.remove(fullPath, { recursive: true });
            }
            else {
                const { unlink } = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
                await unlink(fullPath);
            }
        }
    }
    async readFile(fileName) {
        const fullPath = node_path_1.default.join(this.basePath, fileName);
        if (this.runtime === 'deno') {
            return await Deno.readFile(fullPath);
        }
        else {
            const { readFile } = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
            return await readFile(fullPath);
        }
    }
    async listFiles(folder = "", recursive = false) {
        const fullPath = node_path_1.default.join(this.basePath, folder);
        await this.#ensureDir(fullPath);
        if (this.runtime === 'deno') {
            return await this.#listFilesDeno(fullPath, recursive);
        }
        else {
            const { readdir } = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
            if (!recursive) {
                return await readdir(fullPath);
            }
            const result = [];
            async function walk(dir) {
                const { readdir } = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
                const entries = await readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const entryPath = node_path_1.default.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await walk(entryPath);
                    }
                    else {
                        result.push(node_path_1.default.relative(fullPath, entryPath));
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
        const router = new tezx_1.Router();
        router.get(node_path_1.default.join(this.publicUrl, "/*filename"), async (ctx) => {
            return ctx.sendFile(node_path_1.default.join(this.basePath, ctx?.req?.params?.filename)).catch((error) => {
                return onError(error?.message, ctx);
            });
        });
        return router;
    }
    getPublicUrl(fileName) {
        if (!this.allowPublicAccess)
            throw new Error("Public access is disabled");
        return node_path_1.default.join(this.publicUrl, fileName).replace(/\\/g, "/");
    }
    async #ensureDir(dir) {
        if (this.runtime === 'deno') {
            await Deno.mkdir(dir, { recursive: true });
        }
        else {
            const { mkdir } = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
            await mkdir(dir, { recursive: true });
        }
    }
    #getMimeType(fileName) {
        const ext = node_path_1.default.extname(fileName).replace(".", "").toLowerCase();
        return getMimeTypeFromExtension(ext) || "application/octet-stream";
    }
    async #resolveFileName(filePath) {
        let counter = 1;
        const ext = node_path_1.default.extname(filePath);
        const base = node_path_1.default.basename(filePath, ext);
        const dir = node_path_1.default.dirname(filePath);
        let finalFileName = `${base}${ext}`;
        let finalPath = node_path_1.default.join(dir, finalFileName);
        if (!this.autoRenameOnConflict)
            return { fileName: finalFileName, finalPath };
        while (await this.#exists(finalPath)) {
            finalFileName = `${base}_${counter++}${ext}`;
            finalPath = node_path_1.default.join(dir, finalFileName);
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
                const { access } = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
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
            const entryPath = node_path_1.default.join(dir, entry.name);
            if (entry.isDirectory && recursive) {
                await this.#listFilesDeno(entryPath, recursive, basePath, result);
            }
            else {
                result.push(node_path_1.default.relative(basePath, entryPath));
            }
        }
        return result;
    }
}
exports.LocalFS = LocalFS;
