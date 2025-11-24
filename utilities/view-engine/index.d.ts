declare const version = "v1.0.7";
/**
 * Supported template engines
 * @typedef {"ejs" | "pug" | "hbs" | "nunjucks" | "mustache"} TemplateEngine
 */
type TemplateEngine = "ejs" | "pug" | "hbs" | "nunjucks" | "mustache";
/**
 * Configuration options for the ViewEngine
 * @typedef {Object} ViewEngineOptions
 * @property {boolean} [cache=true] - Whether to cache templates after loading
 * @property {boolean} [autoescape=true] - Auto-escape variables in Nunjucks (optional)
 * @property {Partial<Record<TemplateEngine, string>>} [extensionOverride] - Override default file extensions per engine
 */
interface ViewEngineOptions {
    cache?: boolean;
    autoescape?: boolean;
    extensionOverride?: Partial<Record<TemplateEngine, string>>;
}
/**
 * Class for rendering server-side templates using various engines like EJS, Pug, Handlebars, etc.
 */
declare class ViewEngine {
    #private;
    private engine;
    private viewsPath;
    private templateCache;
    private runtime;
    private options;
    /**
    * Creates an instance of ViewEngine
    * @param {TemplateEngine} engine - The template engine to use
    * @param {string} viewsPath - Path to the directory containing template files
    * @param {ViewEngineOptions} [options] - Optional configuration
    */
    constructor(engine: TemplateEngine, viewsPath: string, options?: ViewEngineOptions);
    /**
    * Renders a template file with given data
    * @param {string} templateName - Name of the template file (without extension)
    * @param {Object} [data={}] - Data to pass into the template
    * @returns {Promise<string>} Rendered HTML output
    * @throws {Error} If template rendering fails
    */
    render(templateName: string, data?: Record<string, any>): Promise<string>;
}

export { type TemplateEngine, ViewEngine, type ViewEngineOptions, ViewEngine as default, version };
