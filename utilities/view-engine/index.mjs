import * as path from 'node:path';
import { Environment, GlobalConfig } from 'tezx/helper';

const version = "v1.0.7";
class ViewEngine {
  engine;
  viewsPath;
  templateCache = /* @__PURE__ */ new Map();
  runtime = Environment.getEnvironment;
  // "node" | "bun" | "deno"
  options;
  /**
  * Creates an instance of ViewEngine
  * @param {TemplateEngine} engine - The template engine to use
  * @param {string} viewsPath - Path to the directory containing template files
  * @param {ViewEngineOptions} [options] - Optional configuration
  */
  constructor(engine, viewsPath, options = {}) {
    this.engine = engine;
    this.viewsPath = viewsPath;
    this.options = {
      cache: options.cache ?? true,
      autoescape: options.autoescape ?? true,
      extensionOverride: options.extensionOverride ?? {}
    };
  }
  /**
  * Renders a template file with given data
  * @param {string} templateName - Name of the template file (without extension)
  * @param {Object} [data={}] - Data to pass into the template
  * @returns {Promise<string>} Rendered HTML output
  * @throws {Error} If template rendering fails
  */
  async render(templateName, data = {}) {
    const extMap = {
      ejs: ".ejs",
      pug: ".pug",
      hbs: ".hbs",
      nunjucks: ".njk",
      mustache: ".mustache"
    };
    const ext = this.options.extensionOverride[this.engine] ?? extMap[this.engine];
    if (!ext) throw new Error(`Unsupported template engine: ${this.engine}`);
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
          const env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(this.viewsPath),
            { autoescape: this.options.autoescape }
          );
          return new Promise((resolve, reject) => {
            env.render(`${templateName}${ext}`, data, (err, res) => {
              if (err) reject(err);
              else resolve(res);
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
    } catch (err) {
      GlobalConfig.debugging.error(
        `[ViewEngine:${this.runtime}] Error rendering '${templateName}': ${err.message}`
      );
      throw err;
    }
  }
  /**
  * Loads and caches template content
  * @param {string} filePath - Path to the template file
  * @returns {Promise<string>} Template content as a string
  */
  async #getCachedTemplate(filePath) {
    if (this.options.cache && this.templateCache.has(filePath)) {
      return this.templateCache.get(filePath);
    }
    let content;
    if (this.runtime === "deno" && typeof Deno !== "undefined" && Deno.readTextFile) {
      content = await Deno.readTextFile(filePath);
    } else {
      const fs = await import('fs/promises');
      content = await fs.readFile(filePath, "utf8");
    }
    if (this.options.cache) {
      this.templateCache.set(filePath, content);
    }
    return content;
  }
  /**
   * Dynamically imports a package/module
   * @param {string} pkg - Package name to import
   * @returns {Promise<any>} Imported module
   * @throws {Error} If package is not installed
   */
  async #dynamicImport(pkg) {
    try {
      return await import(pkg);
    } catch (err) {
      throw new Error(`Failed to load template engine '${pkg}': ${err.message}`);
    }
  }
}

export { ViewEngine, ViewEngine as default, version };
