"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewEngine = exports.version = void 0;
const path = __importStar(require("node:path"));
const helper_1 = require("tezx/helper");
exports.version = "v1.0.2";
class ViewEngine {
    engine;
    viewsPath;
    templateCache = new Map();
    runtime = helper_1.Environment.getEnvironment;
    options;
    constructor(engine, viewsPath, options = {}) {
        this.engine = engine;
        this.viewsPath = viewsPath;
        this.options = {
            cache: options.cache ?? true,
            autoescape: options.autoescape ?? true,
            extensionOverride: options.extensionOverride ?? {},
        };
    }
    async render(templateName, data = {}) {
        const extMap = {
            ejs: ".ejs",
            pug: ".pug",
            hbs: ".hbs",
            nunjucks: ".njk",
            mustache: ".mustache",
        };
        const ext = this.options.extensionOverride[this.engine] ?? extMap[this.engine];
        if (!ext)
            throw new Error(`Unsupported template engine: ${this.engine}`);
        const filePath = path.join(this.viewsPath, `${templateName}${ext}`);
        try {
            switch (this.engine) {
                case "ejs": {
                    const ejs = await this.#dynamicImport("ejs");
                    const html = await this.#getCachedTemplate(filePath);
                    return ejs.render(html, data);
                }
                case "pug": {
                    const pug = await this.#dynamicImport("pug");
                    return Promise.resolve(pug.renderFile(filePath, data));
                }
                case "hbs": {
                    const handlebars = await this.#dynamicImport("handlebars");
                    const html = await this.#getCachedTemplate(filePath);
                    const compiled = handlebars?.default?.compile(html);
                    return compiled(data);
                }
                case "nunjucks": {
                    const nunjucks = await this.#dynamicImport("nunjucks");
                    const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(this.viewsPath), { autoescape: this.options.autoescape });
                    return new Promise((resolve, reject) => {
                        env.render(`${templateName}${ext}`, data, (err, res) => {
                            if (err)
                                reject(err);
                            else
                                resolve(res);
                        });
                    });
                }
                case "mustache": {
                    const mustache = await this.#dynamicImport("mustache");
                    const html = await this.#getCachedTemplate(filePath);
                    return mustache?.default?.render(html, data);
                }
                default:
                    throw new Error(`No renderer found for engine: ${this.engine}`);
            }
        }
        catch (err) {
            helper_1.GlobalConfig.debugging.error(`[ViewEngine:${this.runtime}] Error rendering '${templateName}': ${err.message}`);
            throw err;
        }
    }
    async #getCachedTemplate(filePath) {
        if (this.options.cache && this.templateCache.has(filePath)) {
            return this.templateCache.get(filePath);
        }
        let content;
        if (this.runtime === "deno" && typeof Deno !== "undefined" && Deno.readTextFile) {
            content = await Deno.readTextFile(filePath);
        }
        else {
            const fs = await Promise.resolve().then(() => __importStar(require("fs/promises")));
            content = await fs.readFile(filePath, "utf8");
        }
        if (this.options.cache) {
            this.templateCache.set(filePath, content);
        }
        return content;
    }
    async #dynamicImport(pkg) {
        try {
            return await Promise.resolve(`${pkg}`).then(s => __importStar(require(s)));
        }
        catch (err) {
            throw new Error(`Failed to load template engine '${pkg}': ${err.message}`);
        }
    }
}
exports.ViewEngine = ViewEngine;
